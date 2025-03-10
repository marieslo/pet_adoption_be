const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const PetModel = require('../schemas/PetSchema');
const UserModel = require('../schemas/UserSchema');


// get all pets 
router.get('/', async (req, res) => {
    try {
        const pets = await PetModel.find();
        res.status(200).json(pets);
    } catch (error) {
        console.error('Error fetching pets:', error); 
        res.status(500).json({ message: 'Error fetching pets', error: error.message });
    }
});

// search and autocomplete pets
router.get('/search', async (req, res) => {
    try {
        const { adoptionStatus, type, name, breed, heightCm, weightKg, autocomplete, page = 0, limit = 10 } = req.query;
        const query = {};

        if (adoptionStatus) query.adoptionStatus = adoptionStatus;
        if (type) query.type = type;
        if (heightCm) query.heightCm = { $gte: Number(heightCm) };
        if (weightKg) query.weightKg = { $gte: Number(weightKg) };
        if (autocomplete === 'true') {
            if (name) query.name = { $regex: name, $options: 'i' };
            if (breed) query.breed = { $regex: breed, $options: 'i' };
        } else {
            if (name) query.name = name;
            if (breed) query.breed = breed;
        }
        const pets = await PetModel.find(query)
            .limit(Number(limit))
            .skip(Number(page) * Number(limit));
        if (autocomplete === 'true') {
            const suggestions = pets.map(pet => ({
                name: pet.name,
                breed: pet.breed,
                type: pet.type,
                picture: pet.picture,
            }));
            return res.status(200).json(suggestions);
        }
        res.status(200).json(pets);
    } catch (error) {
        console.error('Error fetching pets:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// single pet page
router.get('/:id', async (req, res) => {
    try {
        const pet = await PetModel.findById(req.params.id); 
        if (!pet) {
            return res.status(404).json({ message: `Pet with ID ${req.params.id} not found` });
        }
        res.status(200).json(pet);
    } catch (error) {
        console.error('Error fetching pet by ID:', error);
        res.status(500).json({ message: 'Error fetching pet by ID', error: error.message });
    }
});

// add new pet
router.post('/addpet', async (req, res) => {
    try {
        const newPet = await PetModel.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Pet added successfully',
            pet: newPet
        });
    } catch (error) {
        console.error('Error adding pet:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add pet',
            error: error.message
        });
    }
});
  
// update pet details
router.put('/:id/details',  async (req, res) => {
    const petId = req.params.id;
    try {
        const updatedPet = await PetModel.findByIdAndUpdate(petId, req.body, { new: true });
        if (!updatedPet) {
            return res.status(404).json({ message: 'Pet not found' });
        }
        res.json(updatedPet);
    } catch (error) {
        console.error('Error updating pet details:', error);
        res.status(500).json({ message: 'Error updating pet details', error: error.message });
    }
});

// delete pet
router.delete('/:id', async (req, res) => {
    const petId = req.params.id;
    try {
      const deletedPet = await PetModel.findByIdAndDelete(petId);
      if (!deletedPet) {
        return res.status(404).json({ message: 'Pet not found' });
      }
      res.json({ message: 'Pet deleted successfully' });
    } catch (error) {
      console.error('Error deleting pet:', error);
      res.status(500).json({ message: 'Error deleting pet' });
    }
});

// like pet
router.post('/:id/like', async (req, res) => {
    try {
        const petId = req.params.id;
        const userId = req.body.userId;

        const pet = await PetModel.findById(petId);
        if (!pet) {
            return res.status(404).json({ message: `Pet with ID ${petId} not found` });
        }

        if (!pet.likedBy.includes(userId)) {
            pet.likedBy.push(userId);
            await pet.save();
            await UserModel.findByIdAndUpdate(userId, { $push: { likedPets: pet._id } });
        }
        res.status(200).json({ message: `Liked pet with ID ${petId}` });
    } catch (error) {
        console.error('Error liking pet:', error);
        res.status(500).json({ message: 'Error liking pet', error: error.message });
    }
});

// unlike pet
router.delete('/:id/unlike/:userId', async (req, res) => {
    try {
        const petId = req.params.id;
        const userId = req.params.userId;
        const pet = await PetModel.findById(petId);
        if (!pet) {
            return res.status(404).json({ message: `Pet with ID ${petId} not found` });
        }
        const index = pet.likedBy.indexOf(userId);
        if (index !== -1) {
            pet.likedBy.splice(index, 1);
            await pet.save();
            await UserModel.findByIdAndUpdate(userId, { $pull: { likedPets: pet._id } });
            return res.status(200).json({ message: `Unliked pet with ID ${petId}` });
        } else {
            return res.status(200).json({ message: `Pet with ID ${petId} is not liked by user ${userId}` });
        }
    } catch (error) {
        console.error('Error unliking pet:', error);
        res.status(500).json({ message: 'Error unliking pet', error: error.message });
    }
});

// adopt pet
router.put('/:id/adopt', async (req, res) => {
    try {
        const { id } = req.params;
        const pet = await PetModel.findById(id);
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        if (!pet.adoptedBy.includes(req.body.userId)) {
            pet.adoptedBy.push(req.body.userId);
            pet.adoptionStatus = 'adopted'; 
            await pet.save();
            await UserModel.findByIdAndUpdate(req.body.userId, { $push: { adoptedPets: pet._id } });
            return res.status(200).json({ message: 'Pet adopted successfully' });
        } else {
            return res.status(200).json({ message: 'Pet is already adopted' });
        }
    } catch (error) {
        console.error('Error adopting pet:', error);
        res.status(500).json({ message: 'Error adopting pet', error: error.message });
    }
});

// foster pet
router.put('/:id/foster', async (req, res) => {
    try {
        const { id } = req.params;
        const pet = await PetModel.findById(id);
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }
        pet.fosteredBy = pet.fosteredBy || [];
        if (!pet.fosteredBy.includes(req.body.userId)) {
            pet.fosteredBy.push(req.body.userId);
            pet.adoptionStatus = 'fostered'; 
            await pet.save();
            await UserModel.findByIdAndUpdate(req.body.userId, { $push: { fosteredPets: pet._id } });
            return res.status(200).json({ message: 'Pet fostered successfully' });
        } else {
            return res.status(200).json({ message: 'Pet is already fostered' });
        }
    } catch (error) {
        console.error('Error fostering pet:', error);
        res.status(500).json({ message: 'Error fostering pet', error: error.message });
    }
});


// return pet
router.put('/:id/return', async (req, res) => {
    try {
        const { id } = req.params;
        const pet = await PetModel.findById(id);
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        const userId = req.body.userId;
        if (pet.adoptedBy.includes(userId)) {
            pet.adoptedBy.pull(userId);
            pet.adoptionStatus = 'adoptable'; 
            await pet.save();
            await UserModel.findByIdAndUpdate(userId, { $pull: { adoptedPets: pet._id } });
            return res.status(200).json({ message: 'Pet returned successfully' });
        } else if (pet.fosteredBy.includes(userId)) {
            pet.fosteredBy.pull(userId);
            pet.adoptionStatus = 'adoptable';
            await pet.save();
            await UserModel.findByIdAndUpdate(userId, { $pull: { fosteredPets: pet._id } });
            return res.status(200).json({ message: 'Pet returned successfully' });
        } else {
            return res.status(200).json({ message: 'User is not currently fostering or adopting this pet' });
        }
    } catch (error) {
        console.error('Error returning pet:', error);
        res.status(500).json({ message: 'Error returning pet', error: error.message });
    }
});

module.exports = router;