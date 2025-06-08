import React, { useState } from 'react';
import { Button, Image, StyleSheet, Text, View, ActivityIndicator, ScrollView, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { imageMap } from './imageMap'; // 👉 Importas tu imageMap generado

// 👉 Función utilitaria para normalizar el campo foto
function normalizarFotoNombre(foto: string): string {
    let path = foto.trim().replace(/\\/g, '/');
    path = path.replace(/^ISIA\/ISIA\//, 'ISIA/');
    return path;
}

// 👉 Detectar versión de mediaTypes compatible
const isMediaTypeAvailable = (ImagePicker as any).MediaType !== undefined;
const mediaType = isMediaTypeAvailable
    ? (ImagePicker as any).MediaType.IMAGE
    : ImagePicker.MediaTypeOptions.Images;

export default function IndexPage() {
    const [image, setImage] = useState<string | null>(null);
    const [resultado, setResultado] = useState<{
        nombre?: string;
        apellido?: string;
        correo?: string;
        similitud?: number;
    } | null>(null);
    const [fotoEncontrada, setFotoEncontrada] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // PRO: estados adicionales
    const [loadingEntrada, setLoadingEntrada] = useState(false);
    const [loadingEncontrada, setLoadingEncontrada] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const animatedSimilitud = useState(new Animated.Value(0))[0];

    const API_URL = 'https://reconocimiento-facial-api-1059485850117.europe-west1.run.app/comparar';

    const pickImage = async () => {
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
    };

    const tomarFoto = async () => {
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
    };

    const enviarImagen = async (uri: string) => {
        try {
            setLoading(true);
            setResultado(null);
            setFotoEncontrada(null);
            setLoadingEncontrada(false);
            fadeAnim.setValue(0);
            animatedSimilitud.setValue(0);

            const formData = new FormData();
            formData.append('file', {
                uri: uri,
                name: 'photo.jpg',
                type: 'image/jpeg',
            } as any);

            const response = await axios.post(API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                const data = response.data;

                setResultado({
                    nombre: data.nombre,
                    apellido: data.apellido,
                    correo: data.correo,
                    similitud: data.similitud,
                });

                // Animación contador de similitud
                Animated.timing(animatedSimilitud, {
                    toValue: data.similitud,
                    duration: 1000,
                    useNativeDriver: false,
                }).start();

                // Imagen encontrada
                const fotoNombre = normalizarFotoNombre(data.foto);
                console.log('👉 fotoNombre:', fotoNombre);
                console.log('👉 Existe en imageMap:', fotoNombre in imageMap);

                const localImagePath = imageMap[fotoNombre] || null;
                setLoadingEncontrada(true);
                setFotoEncontrada(localImagePath);

                // Fade-in de imágenes
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            } else {
                setResultado(null);
                setFotoEncontrada(null);
            }
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                setResultado(null);
                setFotoEncontrada(null);
                alert('❌ No se encontró ninguna persona.');
            } else {
                alert(`❌ Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
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
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Reconocimiento Facial</Text>
            <Button title="Seleccionar imagen" onPress={pickImage} />
            <View style={{ marginTop: 10 }}>
                <Button title="Tomar foto" onPress={tomarFoto} />
            </View>

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

            {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}

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


            {(image || resultado) && (
                <View style={{ marginTop: 20 }}>
                    <Button title="Nueva búsqueda" onPress={nuevaBusqueda} />
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 20,
    },
    label: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    imageRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 20,
        width: '100%',
    },
    imageContainer: {
        alignItems: 'center',
        flex: 1,
    },
    imageLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    imageWrapper: {
        position: 'relative',
    },
    imageSide: {
        width: 150,
        height: 150,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    imageOverlay: {
        position: 'absolute',
        top: '45%',
        left: '45%',
        zIndex: 1,
    },
    resultContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f0f8ff',
        borderRadius: 10,
        width: '90%',
    },
    resultText: {
        fontSize: 16,
        marginBottom: 5,
        textAlign: 'center',
    },
});
