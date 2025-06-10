// components/IndexPage.tsx

import React, { useState } from 'react';
import { styles } from './Styles';
import {
    Button,
    Text,
    View,
    ActivityIndicator,
    ScrollView,
    Animated,
    TextInput,
    Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { imageMap } from '../imageMap'; // corrige la ruta si es necesario

// 👉 Función utilitaria para normalizar el campo foto
function normalizarFotoNombre(foto: string): string {
    let path = foto.trim().replace(/\\/g, '/');
    path = path.replace(/^ISIA\/ISIA\//, 'ISIA/');
    return path;
}

const isMediaTypeAvailable = (ImagePicker as any).MediaType !== undefined;
const mediaType = isMediaTypeAvailable
    ? (ImagePicker as any).MediaType.IMAGE
    : ImagePicker.MediaTypeOptions.Images;

export default function IndexPage() {
    const [image, setImage] = useState<string | null>(null);
    const [resultado, setResultado] = useState<any>(null);
    const [fotoEncontrada, setFotoEncontrada] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingEntrada, setLoadingEntrada] = useState(false);
    const [loadingEncontrada, setLoadingEncontrada] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const animatedSimilitud = useState(new Animated.Value(0))[0];
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingAgregar, setLoadingAgregar] = useState(false);
    const [modalLoadingVisible, setModalLoadingVisible] = useState(false);
    const [loadingSeleccionar, setLoadingSeleccionar] = useState(false);
    const [loadingCamara, setLoadingCamara] = useState(false);
    const [agregar, setAgregar] = useState<boolean>(false);
    const [nombre, setNombre] = useState<string>('');
    const [apellido, setApellido] = useState<string>('');
    const [correo, setCorreo] = useState<string>('');
    const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

    const API_URL_COMPARAR = 'http://10.0.2.2:8000/comparar';
    const API_URL_AGREGAR = 'http://10.0.2.2:8000/agregar_persona';

    const pickImage = async () => {
        try {
            setLoadingSeleccionar(true);

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: mediaType,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                const uri = result.assets[0].uri;
                setLoadingEntrada(true);
                setImage(uri);
                enviarImagen(uri);
            }
        } finally {
            setLoadingSeleccionar(false);
        }
    };

    const tomarFoto = async () => {
        try {
            setLoadingCamara(true);

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: mediaType,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                const uri = result.assets[0].uri;
                setLoadingEntrada(true);
                setImage(uri);
                enviarImagen(uri);
            }
        } finally {
            setLoadingCamara(false);
        }
    };

    const enviarImagen = async (uri: string) => {
        try {
            setModalLoadingVisible(true);
            setLoading(true);
            setResultado(null);
            setFotoEncontrada(null);
            setLoadingEncontrada(false);
            fadeAnim.setValue(0);
            animatedSimilitud.setValue(0);
            setAgregar(false);
            setNombre('');
            setApellido('');
            setCorreo('');
            setErrorMensaje(null);

            const formData = new FormData();
            formData.append('file', {
                uri: uri,
                name: 'photo.jpg',
                type: 'image/jpeg',
            } as any);

            const response = await axios.post(API_URL_COMPARAR, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                validateStatus: function (status) {
                    return true;
                },
            });

            console.log('👉 response completo:', response);

            if (response.status === 200) {
                const data = response.data;

                if (data.agregar === true) {
                    alert(`⚠️ ${data.mensaje}`);
                    setAgregar(true);
                    setErrorMensaje(null);
                } else {
                    setResultado(data.datos);
                    const fotoEncontradaUri = `http://10.0.2.2:8000/${normalizarFotoNombre(data.datos.foto)}`;
                    setFotoEncontrada({ uri: fotoEncontradaUri });

                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }).start();

                    Animated.timing(animatedSimilitud, {
                        toValue: data.datos.similitud,
                        duration: 1000,
                        useNativeDriver: false,
                    }).start();

                    setErrorMensaje(null);
                }

            } else if (response.status === 422) {
                const mensajeBackend = response.data?.mensaje || 'No se detectó rostro en la imagen.';
                alert(`⚠️ ${mensajeBackend}`);
                setAgregar(false);
                setResultado(null);
                setFotoEncontrada(null);
                setErrorMensaje(mensajeBackend);
            } else {
                const mensajeBackend = response.data?.mensaje || 'Error desconocido';
                alert(`❌ Error (${response.status}): ${mensajeBackend}`);
                setAgregar(false);
                setResultado(null);
                setFotoEncontrada(null);
                setErrorMensaje(mensajeBackend);
            }

        } catch (error: any) {
            if (error.response) {
                const safeMensajeBackend = error.response.data?.mensaje
                    ? error.response.data.mensaje
                    : (typeof error.response.data === 'string' ? error.response.data : 'Error desconocido');

                if (error.response.status === 422) {
                    alert(`⚠️ ${safeMensajeBackend}`);
                    setAgregar(false);
                    setResultado(null);
                    setFotoEncontrada(null);
                    setErrorMensaje(safeMensajeBackend);
                } else {
                    alert(`❌ Error (${error.response.status}): ${safeMensajeBackend}`);
                    setAgregar(false);
                    setResultado(null);
                    setFotoEncontrada(null);
                    setErrorMensaje(safeMensajeBackend);
                }
            } else {
                alert(`❌ Error de red: ${error.message}`);
                setAgregar(false);
                setResultado(null);
                setFotoEncontrada(null);
                setErrorMensaje(`Error de red: ${error.message}`);
            }
        } finally {
            setLoading(false);
            setModalLoadingVisible(false);
        }
    };

    const enviarAgregarPersona = async () => {
        if (!nombre || !apellido || !correo || !image) {
            alert('Por favor complete todos los campos.');
            return;
        }

        try {
            setLoadingAgregar(true);
            setLoading(true);

            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('apellido', apellido);
            formData.append('correo', correo);
            formData.append('imagen', {
                uri: image,
                name: 'photo.jpg',
                type: 'image/jpeg',
            } as any);

            const response = await axios.post(API_URL_AGREGAR, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                setModalVisible(true);
            }
        } catch (error: any) {
            if (error.response) {
                const mensajeBackend = error.response.data?.mensaje || 'Error desconocido';
                alert(`❌ Error al agregar persona: ${mensajeBackend}`);
            } else {
                alert(`❌ Error al agregar persona: ${error.message}`);
            }
        } finally {
            setLoading(false);
            setLoadingAgregar(false);
        }
    };

    const nuevaBusqueda = () => {
        setImage(null);
        setResultado(null);
        setFotoEncontrada(null);
        setLoadingEntrada(false);
        setLoadingEncontrada(false);
        fadeAnim.setValue(0);
        animatedSimilitud.setValue(0);
        setAgregar(false);
        setNombre('');
        setApellido('');
        setCorreo('');
        setErrorMensaje(null);
    };

    // --- UI ---
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Reconocimiento Facial</Text>

            {!image && (
                <Button
                    title={loadingSeleccionar ? 'Seleccionando imagen...' : '📁 Seleccionar imagen'}
                    color="#0066cc"
                    onPress={pickImage}
                    disabled={loadingSeleccionar || loadingCamara || loadingAgregar || modalLoadingVisible}
                />
            )}

            <View style={{ marginTop: 10 }}>
                <Button
                    title={loadingCamara ? 'Abriendo cámara...' : 'Tomar foto'}
                    onPress={tomarFoto}
                    disabled={loadingCamara || loadingSeleccionar || loadingAgregar || modalLoadingVisible}
                />
            </View>

            {errorMensaje && (
                <View style={styles.errorMessageBox}>
                    <Text style={styles.errorMessageText}>{errorMensaje}</Text>
                </View>
            )}

            {image && (
                <>
                    <Text style={styles.label}>📷 Comparación de imágenes:</Text>
                    <View style={styles.imageRow}>
                        <View style={styles.imageContainer}>
                            <Text style={styles.imageLabel}>Entrada</Text>
                            <View style={styles.imageWrapper}>
                                <Animated.Image
                                    source={{ uri: image }}
                                    style={[styles.imageSide, { opacity: fadeAnim }]}
                                    onLoadEnd={() => setLoadingEntrada(false)}
                                />
                                {loadingEntrada && <ActivityIndicator size="small" color="#0000ff" style={styles.imageOverlay} />}
                            </View>
                        </View>
                        {fotoEncontrada && (
                            <View style={styles.imageContainer}>
                                <Text style={styles.imageLabel}>Encontrada</Text>
                                <View style={styles.imageWrapper}>
                                    <Animated.Image
                                        source={fotoEncontrada}
                                        style={[styles.imageSide, { opacity: fadeAnim }]}
                                        onLoadEnd={() => setLoadingEncontrada(false)}
                                    />
                                    {loadingEncontrada && <ActivityIndicator size="small" color="#0000ff" style={styles.imageOverlay} />}
                                </View>
                            </View>
                        )}
                    </View>
                </>
            )}

            {resultado && (
                <View style={styles.resultContainer}>
                    <Text style={styles.label}>✅ Resultado:</Text>
                    <Text style={styles.resultText}>Nombre: {resultado.nombre}</Text>
                    <Text style={styles.resultText}>Apellido: {resultado.apellido}</Text>
                    <Text style={styles.resultText}>Correo: {resultado.correo}</Text>
                    <Animated.Text style={styles.resultText}>
                        Similitud: {resultado.similitud?.toFixed(2)}%
                    </Animated.Text>
                </View>
            )}

            {agregar && (
                <View style={styles.resultContainer}>
                    <Text style={styles.label}>➕ Agregar nueva persona:</Text>
                    <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
                    <TextInput placeholder="Apellido" value={apellido} onChangeText={setApellido} style={styles.input} />
                    <TextInput placeholder="Correo" value={correo} onChangeText={setCorreo} style={styles.input} keyboardType="email-address" />
                    <Button
                        title={loadingAgregar ? 'Agregando...' : 'Agregar persona'}
                        onPress={enviarAgregarPersona}
                        disabled={loadingAgregar}
                    />
                </View>
            )}

            {(image || resultado || agregar) && (
                <View style={{ marginTop: 20 }}>
                    <Button title="Nueva búsqueda" onPress={nuevaBusqueda} />
                </View>
            )}

            {modalVisible && (
                <Modal transparent={true} animationType="slide" visible={modalVisible} onRequestClose={() => {
                    setModalVisible(false);
                    nuevaBusqueda();
                }}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>✅ Persona agregada correctamente.</Text>
                            <Button title="Aceptar" onPress={() => {
                                setModalVisible(false);
                                nuevaBusqueda();
                            }} />
                        </View>
                    </View>
                </Modal>
            )}

            {modalLoadingVisible && (
                <Modal transparent={true} animationType="fade" visible={modalLoadingVisible} onRequestClose={() => {}}>
                    <View style={styles.modalLoadingOverlay}>
                        <View style={styles.modalLoadingBox}>
                            <ActivityIndicator size="large" color="#00ffcc" />
                            <Text style={styles.modalLoadingText}>Procesando imagen...</Text>
                        </View>
                    </View>
                </Modal>
            )}
        </ScrollView>
    );
}
