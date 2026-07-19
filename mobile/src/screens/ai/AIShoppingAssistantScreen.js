import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { BASE_URL } from '../../services/api';

const AIShoppingAssistantScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([
        { id: '1', text: 'Hello! I am your AI Shopping Assistant. You can ask me about our return policies, or upload an image to find similar products in our store!', isBot: true }
    ]);
    const [inputText, setInputText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef();

    const handleSelectImage = () => {
        const options = {
            mediaType: 'photo',
            quality: 0.8,
            includeBase64: true,
            maxWidth: 800,
            maxHeight: 800,
        };
        launchImageLibrary(options, (response) => {
            if (response.assets && response.assets.length > 0) {
                setSelectedImage(response.assets[0]);
            }
        });
    };

    const handleSend = async () => {
        if (!inputText.trim() && !selectedImage) return;

        const userMessage = {
            id: Date.now().toString(),
            text: inputText,
            imageUri: selectedImage ? selectedImage.uri : null,
            isBot: false,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        const base64Data = selectedImage ? selectedImage.base64 : null;
        setSelectedImage(null);
        setLoading(true);

        try {
            const response = await axios.post(`${BASE_URL}/api/ai-assistant/chat`, {
                message: userMessage.text,
                base64Image: base64Data
            });

            const botMessage = {
                id: (Date.now() + 1).toString(),
                text: response.data.text,
                products: response.data.products, // Concept 1: Vector DB results
                isBot: true,
            };
            setMessages((prev) => [...prev, botMessage]);

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not connect to AI Assistant. Check backend logs.");
            setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: "I'm having trouble connecting right now.", isBot: true }]);
        } finally {
            setLoading(false);
        }
    };

    const renderProductCard = (product) => (
        <TouchableOpacity 
            key={product.id} 
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
        >
            <Image 
                source={{ uri: product.image?.startsWith('http') ? product.image : `${BASE_URL}/products/${product.image}` }} 
                style={styles.productImage} 
                resizeMode="cover"
            />
            <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
                <Text style={styles.productPrice}>₹{product.price}</Text>
                <Text style={styles.matchScore}>AI Match: {Math.round(product.score * 100)}%</Text>
            </View>
        </TouchableOpacity>
    );

    const renderMessage = ({ item }) => (
        <View style={[styles.messageBubble, item.isBot ? styles.botBubble : styles.userBubble]}>
            {item.imageUri && (
                <Image source={{ uri: item.imageUri }} style={styles.messageImage} />
            )}
            {item.text ? <Text style={[styles.messageText, item.isBot ? styles.botText : styles.userText]}>{item.text}</Text> : null}
            
            {/* Render Vector DB Search Results */}
            {item.products && item.products.length > 0 && (
                <View style={styles.productContainer}>
                    <Text style={styles.productHeader}>I found these similar items:</Text>
                    {item.products.map(p => renderProductCard(p))}
                </View>
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>AI Shopping Assistant</Text>
                    <Text style={styles.headerSubtitle}>Powered by Vision, Agents & RAG</Text>
                </View>
            </View>

            {/* Chat Area */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.chatContainer}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#d4af37" />
                    <Text style={styles.loadingText}>AI is thinking...</Text>
                </View>
            )}

            {/* Selected Image Preview */}
            {selectedImage && (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                    <TouchableOpacity style={styles.closePreview} onPress={() => setSelectedImage(null)}>
                        <Icon name="close-circle" size={24} color="red" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <TouchableOpacity onPress={handleSelectImage} style={styles.iconButton}>
                    <Icon name="camera" size={26} color="#555" />
                </TouchableOpacity>
                <TextInput
                    style={styles.textInput}
                    placeholder="Ask a question or upload an image..."
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                />
                <TouchableOpacity onPress={handleSend} style={styles.sendButton} disabled={loading || (!inputText.trim() && !selectedImage)}>
                    <Icon name="send" size={22} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: {
        backgroundColor: '#d4af37', // Brand gold color
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 15,
        paddingHorizontal: 15,
    },
    backButton: { marginRight: 15 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
    chatContainer: { padding: 15, paddingBottom: 20 },
    messageBubble: {
        maxWidth: '85%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
    },
    botBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
    userBubble: { backgroundColor: '#d4af37', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    messageText: { fontSize: 15, lineHeight: 22 },
    botText: { color: '#333' },
    userText: { color: '#fff' },
    messageImage: { width: 200, height: 200, borderRadius: 8, marginBottom: 8 },
    loadingContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, alignSelf: 'flex-start' },
    loadingText: { marginLeft: 8, color: '#666', fontStyle: 'italic' },
    previewContainer: { position: 'relative', margin: 10, alignSelf: 'flex-start' },
    previewImage: { width: 80, height: 80, borderRadius: 8 },
    closePreview: { position: 'absolute', top: -10, right: -10 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#ddd'
    },
    iconButton: { padding: 10 },
    textInput: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 15,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#d4af37',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    productContainer: { marginTop: 12, borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 },
    productHeader: { fontWeight: 'bold', marginBottom: 8, color: '#333' },
    productCard: { flexDirection: 'row', backgroundColor: '#f9f9f9', borderRadius: 8, padding: 8, marginBottom: 8, alignItems: 'center' },
    productImage: { width: 60, height: 60, borderRadius: 6, backgroundColor: '#eee' },
    productInfo: { flex: 1, marginLeft: 10 },
    productTitle: { fontSize: 13, fontWeight: '600', color: '#222' },
    productPrice: { fontSize: 13, color: '#d4af37', marginTop: 2, fontWeight: 'bold' },
    matchScore: { fontSize: 11, color: '#888', marginTop: 2 }
});

export default AIShoppingAssistantScreen;
