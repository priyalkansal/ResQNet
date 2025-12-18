import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Camera, MapPin, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Button, Header } from '../../components/UIComponents';
import { auth } from '../../services/firebaseConfig';
import { supabase } from '../../services/supabaseConfig';

export default function ReportScreen() {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('General');
  const [details, setDetails] = useState('');
  
  // --- Camera State ---
  const [photoUri, setPhotoUri] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  // --- Camera Functions ---
  const openCamera = async () => {
    if (!permission) return;
    
    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Permission Required", "Camera access is needed to add evidence.");
        return;
      }
    }
    setIsCameraOpen(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: true, // Needed if you want to upload raw data later
          skipProcessing: true,
        });
        setPhotoUri(photo.uri);
        setIsCameraOpen(false);
      } catch (e) {
        Alert.alert("Error", "Failed to capture image.");
      }
    }
  };

  const submitReport = async () => {
    if (!details.trim()) {
      Alert.alert("Missing Details", "Please describe the situation briefly.");
      return;
    }

    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to submit a report.");
      return;
    }

    setLoading(true);
    try {
      let loc = await Location.getCurrentPositionAsync({});
      
      // Prepare data payload
      const reportData = {
        user_email: auth.currentUser.email,
        type: type,
        details: details,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        // If you had an image upload function, you'd put the URL here.
        // For now, we can just log that an image was taken.
        evidence_url: photoUri ? "Image captured (local)" : null,
        status: 'Pending'
        
      };

      const { error } = await supabase.from('reports').insert(reportData);

      if (error) throw error;

      Alert.alert("Success", "Report submitted. Check status in Profile");
      setDetails('');
      setPhotoUri(null);
      setType('General');
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <Header title="Report Incident" />
      <ScrollView className="p-5" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Location Card */}
        <View className="bg-white p-4 rounded-xl border border-slate-200 mb-4">
          <View className="flex-row items-center gap-2">
             <MapPin size={20} color="#258cf4" />
             <Text className="font-bold text-slate-800">Current Device Location</Text>
          </View>
          <Text className="text-xs text-slate-400 ml-7 mt-1"> GPS Accuracy: High</Text>
        </View>

        {/* Incident Type Selector */}
        <Text className="font-bold text-slate-500 text-xs uppercase mb-2 ml-1">Incident Type</Text>
        <View className="flex-row gap-2 flex-wrap mb-6">
          {['Flood', 'Fire', 'Landslide', 'Medical', 'Blocked Road'].map(t => (
            <TouchableOpacity 
              key={t} 
              onPress={() => setType(t)}
              className={`px-4 py-3 rounded-xl border ${type === t ? 'bg-[#258cf4] border-[#258cf4]' : 'bg-white border-slate-200'}`}
            >
              <Text className={`font-bold ${type === t ? 'text-white' : 'text-slate-600'}`}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Details Input */}
        <Text className="font-bold text-slate-500 text-xs uppercase mb-2 ml-1">Details</Text>
        <TextInput 
          value={details}
          onChangeText={setDetails}
          placeholder="Describe the situation..."
          multiline
          numberOfLines={4}
          className="bg-white p-4 rounded-xl border border-slate-200 text-slate-800 text-base mb-6 h-32"
          textAlignVertical="top"
        />

        {/* Camera / Photo Section */}
        {photoUri ? (
          <View className="mb-6 relative">
            <Image 
              source={{ uri: photoUri }} 
              className="w-full h-48 rounded-xl bg-slate-200"
              resizeMode="cover"
            />
            <TouchableOpacity 
              onPress={() => setPhotoUri(null)}
              className="absolute top-2 right-2 bg-red-500 p-2 rounded-full"
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={openCamera}
            className="bg-slate-100 border-2 border-dashed border-slate-300 p-4 rounded-xl flex-row items-center justify-center gap-2 mb-6 h-16"
          >
             <Camera size={20} color="#94a3b8" />
             <Text className="text-slate-500 font-bold">Add Photo Evidence</Text>
          </TouchableOpacity>
        )}

        {/* Submit Button */}
        {loading ? (
          <ActivityIndicator size="large" color="#258cf4" /> 
        ) : (
          <Button fullWidth onPress={submitReport} variant="danger">Submit Report</Button>
        )}
      </ScrollView>

      {/* --- Camera Modal --- */}
      <Modal visible={isCameraOpen} animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <CameraView style={{ flex: 1 }} ref={cameraRef} facing="back">
            <View className="flex-1 justify-end pb-10 px-6">
              <View className="flex-row justify-between items-center">
                
                {/* Cancel Button */}
                <TouchableOpacity onPress={() => setIsCameraOpen(false)}>
                  <Text className="text-white text-lg font-bold">Cancel</Text>
                </TouchableOpacity>

                {/* Capture Button */}
                <TouchableOpacity 
                  onPress={takePicture}
                  className="w-20 h-20 rounded-full border-4 border-white justify-center items-center"
                >
                  <View className="w-16 h-16 rounded-full bg-white" />
                </TouchableOpacity>

                {/* Spacer for alignment */}
                <View className="w-12" /> 
                
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>

    </View>
  );
}