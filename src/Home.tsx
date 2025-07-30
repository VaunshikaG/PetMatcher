import React, { useState, useEffect } from 'react';
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
  SafeAreaView,
  Platform,
} from 'react-native';
import { launchImageLibrary, launchCamera, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import Icons from '@react-native-vector-icons/fontawesome6'
import { AppTheme } from './utils/colors';
import { AppConstants } from './utils/constants';
import { DogReqData } from './models/dogModel';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './features/store';
import { getRandomDogImgThunk, postDogDataThunk } from './features/dogThunk';
import Snackbar from 'react-native-snackbar';
import { clearAll } from './features/dogSlice';

interface FormData {
  petName: string;
  breed: string;
  age: string;
  selectedImage: { uri: string } | '';
}

const Home = () => {
  const { isLoading, img, status } = useSelector((state: RootState) => state.dogReducer);
  const dispatch: AppDispatch = useDispatch();

  const [formData, setFormData] = useState<FormData>({
    petName: '',
    breed: '',
    age: '',
    selectedImage: '',
  });
  const [errors, setErrors] = useState({
    petName: '',
    breed: '',
    age: '',
    selectedImage: '',
  });
  const [breedModalVisible, setBreedModalVisible] = useState(false);

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

  const showImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  const openCamera = () => {
    const options: CameraOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchCamera(options, response => {
      if (response.didCancel || response.errorMessage) {
        return;
      }
      if (response.assets && response.assets[0]?.uri) {
        const source = { uri: response.assets[0]?.uri };
        setFormData({ ...formData, selectedImage: source });
      }
    });
  };

  const openGallery = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel || response.errorMessage) {
        return;
      }
      if (response.assets && response.assets[0]?.uri) {
        const source = { uri: response.assets[0]?.uri };
        setFormData({ ...formData, selectedImage: source });
      }
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      petName: '',
      breed: '',
      age: '',
      selectedImage: '',
    };

    if (!formData.petName.trim()) {
      newErrors.petName = AppConstants.fieldRequired;
    }

    if (!formData.breed.trim()) {
      newErrors.breed = AppConstants.fieldRequired;
    }

    if (!formData.selectedImage) {
      newErrors.selectedImage = AppConstants.fieldRequired;
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error.length > 0);
  };

  const submitPetDetails = async () => {
    if (!validateForm()) return;

    try {
      const petData: DogReqData = {
        name: formData.petName,
        breed: formData.breed,
        age: formData.age,
        image: formData.selectedImage,
      };

      const result = await dispatch(postDogDataThunk(petData));
      if (postDogDataThunk.fulfilled.match(result)) {
        Snackbar.show({
          text: AppConstants.successMsg,
          duration: Snackbar.LENGTH_SHORT,
        });
        fetchRandomDogImage();
      } else {
        const errorMessage = result.payload as string;
        Snackbar.show({
          text: errorMessage || AppConstants.submitFailed,
          duration: Snackbar.LENGTH_SHORT,
        });
      }

    } catch (error) {
      Snackbar.show({
        text: error as string || AppConstants.tryAgain,
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  const fetchRandomDogImage = async () => {
    try {
      const result = await dispatch(getRandomDogImgThunk());
      if (getRandomDogImgThunk.fulfilled.match(result)) {
      } else {
        const errorMessage = result.payload as string;
        Snackbar.show({
          text: errorMessage || 'Failed to fetch image. Please try again.',
          duration: Snackbar.LENGTH_SHORT,
        });
      }
    } catch (error) {
      Snackbar.show({
        text: error as string || AppConstants.tryAgain,
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="default" backgroundColor={AppTheme.purple} />
      {Platform.OS === 'ios' && (
        <SafeAreaView style={{ backgroundColor: AppTheme.purple }} />
      )}
      <ScrollView>
        <View style={styles.header}>
          <Icons name='dog' iconStyle='solid' size={20} />
          <Text style={styles.title}>Find your perfect pet match!</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Your Pet</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Pet Photo *</Text>
            <TouchableOpacity
              style={styles.imageUploadButton}
              onPress={showImagePicker}
            >
              {formData.selectedImage ? (
                <Image source={{ uri: formData.selectedImage.uri }} style={styles.selectedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icons name='camera' iconStyle='solid' size={20} />
                  <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.selectedImage && <Text style={styles.errorText}>{errors.selectedImage}</Text>}

            <Text style={styles.label}>Pet Name *</Text>
            <TextInput
              style={[styles.input, errors.petName && styles.inputError]}
              value={formData.petName}
              onChangeText={value => handleInputChange('petName', value)}
              placeholder={AppConstants.petNamePlaceHolder}
              placeholderTextColor={AppTheme.grey1}
            />
            {errors.petName && <Text style={styles.errorText}>{errors.petName}</Text>}

            <Text style={styles.label}>Breed *</Text>
            <TouchableOpacity
              style={[styles.input, errors.breed && styles.inputError]}
              onPress={() => setBreedModalVisible(true)}
            >
              <Text style={formData.breed ? styles.breedText : styles.placeholderText}>
                {formData.breed || "Select a breed"}
              </Text>
            </TouchableOpacity>
            {errors.breed && <Text style={styles.errorText}>{errors.breed}</Text>}

            <Text style={styles.label}>Age (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.age}
              onChangeText={value => handleInputChange('age', value)}
              placeholder={AppConstants.agePlaceHolder}
              placeholderTextColor={AppTheme.grey1}
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={submitPetDetails}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>Submit Pet Details</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={breedModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setBreedModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select a Breed</Text>
              <ScrollView>
                {breedOptions.map((breedOption, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.modalText}
                    onPress={() => {
                      handleInputChange('breed', breedOption);
                      setBreedModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalText}>{breedOption}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => setBreedModalVisible(false)}
              >
                <Text style={styles.submitButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


        {img && (<View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Pet of the Day</Text>
          <View style={styles.randomDogContainer}>
            <Image source={{ uri: img }} style={styles.randomDogImage} />
          </View>
        </View>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.white2,
  },
  header: {
    backgroundColor: AppTheme.purple,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    color: AppTheme.white1,
    marginLeft: 10,
    fontWeight: '600'
  },
  section: {
    margin: 15,
    backgroundColor: AppTheme.white1,
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: AppTheme.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppTheme.grey4,
    marginBottom: 15,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: AppTheme.grey4,
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.grey2,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: AppTheme.white1,
    marginBottom: 3,
  },
  inputError: {
    borderColor: AppTheme.red,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: AppTheme.grey2,
    borderRadius: 8,
    backgroundColor: AppTheme.white1,
    marginBottom: 3,
  },
  picker: {
    height: 50,
  },
  imageUploadButton: {
    borderWidth: 2,
    borderColor: AppTheme.grey2,
    borderStyle: 'dashed',
    borderRadius: 8,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppTheme.white2,
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 18,
    color: AppTheme.grey3,
    marginVertical: 5,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  submitButton: {
    backgroundColor: AppTheme.purple,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  submitButtonText: {
    color: AppTheme.white1,
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: AppTheme.red,
    fontSize: 14,
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    height: '60%',
    backgroundColor: AppTheme.white1,
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppTheme.green,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 15,
    color: AppTheme.grey4,
    marginBottom: 5,
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
  breedText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  tryButton: {
    width: '50%',
    backgroundColor: AppTheme.green,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 5,
    paddingVertical: 10,
    margin: 15,
  },
  tryButtonText: {
    color: AppTheme.white1,
    fontSize: 13,
  }
});

export default Home;