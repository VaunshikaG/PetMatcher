// App.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {Picker} from '@react-native-picker/picker';

const App = () => {
  // State management
  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [randomDogImage, setRandomDogImage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({});

  // Breed options for dropdown
  const breedOptions = [
    'Golden Retriever',
    'Labrador',
    'German Shepherd',
    'Bulldog',
    'Poodle',
    'Beagle',
    'Rottweiler',
    'Yorkshire Terrier',
    'Boxer',
    'Dachshund',
    'Other',
  ];

  // Fetch random dog image on app load
  useEffect(() => {
    fetchRandomDogImage();
  }, []);

  const fetchRandomDogImage = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://dog.ceo/api/breeds/image/random');
      const data = await response.json();
      if (data.status === 'success') {
        setRandomDogImage(data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch random dog image');
    } finally {
      setLoading(false);
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {text: 'Camera', onPress: () => openCamera()},
        {text: 'Gallery', onPress: () => openGallery()},
        {text: 'Cancel', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchCamera(options, response => {
      if (response.didCancel || response.error) {
        return;
      }
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel || response.error) {
        return;
      }
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!petName.trim()) {
      newErrors.petName = 'Pet name is required';
    }

    if (!breed.trim()) {
      newErrors.breed = 'Breed is required';
    }

    if (!selectedImage) {
      newErrors.image = 'Pet image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitPetDetails = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const petData = {
        name: petName,
        breed: breed,
        age: age || 'Not specified',
        image: selectedImage?.uri || '',
        timestamp: new Date().toISOString(),
      };

      const response = await fetch('https://reqres.in/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(petData),
      });

      const result = await response.json();

      if (response.ok) {
        setShowSuccessModal(true);
        // Reset form
        setPetName('');
        setBreed('');
        setAge('');
        setSelectedImage(null);
        setErrors({});
        // Fetch new random dog image
        fetchRandomDogImage();
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit pet details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🐕 Pet Matcher</Text>
          <Text style={styles.subtitle}>Find your perfect pet match!</Text>
        </View>

        {/* Random Dog Image Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Pet of the Day</Text>
          {randomDogImage ? (
            <View style={styles.randomDogContainer}>
              <Image source={{uri: randomDogImage}} style={styles.randomDogImage} />
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={fetchRandomDogImage}
                disabled={loading}
              >
                <Text style={styles.refreshButtonText}>
                  {loading ? 'Loading...' : 'Get New Pet'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ActivityIndicator size="large" color="#007bff" />
          )}
        </View>

        {/* Pet Details Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Your Pet</Text>

          {/* Image Upload */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Pet Photo *</Text>
            <TouchableOpacity 
              style={styles.imageUploadButton}
              onPress={showImagePicker}
            >
              {selectedImage ? (
                <Image source={{uri: selectedImage.uri}} style={styles.selectedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>📷</Text>
                  <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
          </View>

          {/* Pet Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Pet Name *</Text>
            <TextInput
              style={[styles.input, errors.petName && styles.inputError]}
              value={petName}
              onChangeText={setPetName}
              placeholder="Enter your pet's name"
              placeholderTextColor="#999"
            />
            {errors.petName && <Text style={styles.errorText}>{errors.petName}</Text>}
          </View>

          {/* Breed */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Breed *</Text>
            <View style={[styles.pickerContainer, errors.breed && styles.inputError]}>
              <Picker
                selectedValue={breed}
                onValueChange={setBreed}
                style={styles.picker}
              >
                <Picker.Item label="Select a breed" value="" />
                {breedOptions.map((breedOption, index) => (
                  <Picker.Item 
                    key={index} 
                    label={breedOption} 
                    value={breedOption} 
                  />
                ))}
              </Picker>
            </View>
            {errors.breed && <Text style={styles.errorText}>{errors.breed}</Text>}
          </View>

          {/* Age (Optional) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Age (Optional)</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Enter age (e.g., 2 years)"
              placeholderTextColor="#999"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={submitPetDetails}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Pet Details</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>🎉 Success!</Text>
              <Text style={styles.modalText}>
                Your pet details have been submitted successfully!
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowSuccessModal(false)}
              >
                <Text style={styles.modalButtonText}>Great!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e3f2fd',
  },
  section: {
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  randomDogContainer: {
    alignItems: 'center',
  },
  randomDogImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  imageUploadButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 5,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 30,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;