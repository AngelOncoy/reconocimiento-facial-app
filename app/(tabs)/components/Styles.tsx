// components/IndexPage.styles.ts

import { StyleSheet } from 'react-native';



export const styles = StyleSheet.create({
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
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalLoadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    modalLoadingBox: {
        backgroundColor: '#fff',
        padding: 25,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'column',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalLoadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    errorMessageBox: {
        marginTop: 20,
        padding: 12,
        backgroundColor: '#ffe6e6',
        borderRadius: 8,
        borderColor: '#ff0000',
        borderWidth: 1,
    },
    errorMessageText: {
        color: '#ff0000',
        fontWeight: 'bold',
        textAlign: 'center',
    },

});
