import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, Image } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { initDB, getHappiness, updateHappiness } from './Database';

export default function App() {
    const [pet1Happiness, setPet1Happiness] = useState(100);
    const [pet1Treats, setPet1Treats] = useState(5);
    const [pet2Happiness, setPet2Happiness] = useState(100);
    const [pet2Treats, setPet2Treats] = useState(5);
    const [sound, setSound] = useState();
    const [selectedPet, setSelectedPet] = useState('pet1');

    useEffect(() => {
        initDB();
        resetBothPets();
        loadAudio();

        const interval = setInterval(() => {
            updateBothPetsHappiness();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchHappiness = async () => {
        const fetchedHappiness = await getHappiness();
        setPet1Happiness(fetchedHappiness);
        setPet2Happiness(fetchedHappiness);
    };

    const loadAudio = async () => {
        const { sound } = await Audio.Sound.createAsync(
            require('./assets/Techbeat.mp3'),
            { shouldPlay: false }
        );
        setSound(sound);
    };

    const updateHappinessAndTreats = (changeInHappiness, changeInTreats) => {
        if (selectedPet === 'pet1') {
            setPet1Happiness((happiness) => Math.min(happiness + changeInHappiness, 150));
            setPet1Treats((treats) => Math.max(treats + changeInTreats, 0));
        } else {
            setPet2Happiness((happiness) => Math.min(happiness + changeInHappiness, 150));
            setPet2Treats((treats) => Math.max(treats + changeInTreats, 0));
        }
        playSound();
        Haptics.selectionAsync();
    };

    const handlePress = () => updateHappinessAndTreats(10, 0);
    const handleMakeSad = () => updateHappinessAndTreats(-10, 0);
    const handlePetting = () => updateHappinessAndTreats(5, 0);
    const handleUseTreat = () => {
        if ((selectedPet === 'pet1' ? pet1Treats : pet2Treats) > 0) {
            updateHappinessAndTreats(20, -1);
        }
    };

    const handleReset = () => {
        resetBothPets();
    };

    const resetBothPets = () => {
        setPet1Happiness(100);
        setPet1Treats(5);
        setPet2Happiness(100);
        setPet2Treats(5);
    };

    const updateBothPetsHappiness = () => {
        setPet1Happiness((happiness) => Math.max(happiness - 3, 0));
        setPet2Happiness((happiness) => Math.max(happiness - 3, 0));
    };

    const playSound = async () => {
        sound?.playAsync();
    };

    const getPetImageSource = () => {
        const currentHappiness = selectedPet === 'pet1' ? pet1Happiness : pet2Happiness;
        if (currentHappiness >= 50) {
            return require('./assets/smiling.jpeg');
        } else if (currentHappiness > 30) {
            return require('./assets/neutral.jpeg');
        } else {
            return require('./assets/sad.jpeg');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Interact with your pet!</Text>
            <View style={styles.petSelector}>
                <Pressable
                    style={selectedPet === 'pet1' ? styles.petSelectorButtonActive : styles.petSelectorButton}
                    onPress={() => setSelectedPet('pet1')}
                >
                    <Text style={styles.buttonText}>Pet 1</Text>
                </Pressable>
                <Pressable
                    style={selectedPet === 'pet2' ? styles.petSelectorButtonActive : styles.petSelectorButton}
                    onPress={() => setSelectedPet('pet2')}
                >
                    <Text style={styles.buttonText}>Pet 2</Text>
                </Pressable>
            </View>
            <Image source={getPetImageSource()} style={styles.petImage} />
            <Text style={styles.text}>{selectedPet === 'pet1' ? 'Pet 1' : 'Pet 2'}'s Happiness: {selectedPet === 'pet1' ? pet1Happiness : pet2Happiness}</Text>
            <View style={styles.buttonContainer}>
                <Pressable style={styles.button} onPress={handlePress}>
                    <Text style={styles.buttonText}>Make Happy</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={handleMakeSad}>
                    <Text style={styles.buttonText}>Swiping</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={handlePetting}>
                    <Text style={styles.buttonText}>Pet Me</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={handleUseTreat}>
                    <Text style={styles.buttonText}>Give Treat</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={handleReset}>
                    <Text style={styles.buttonText}>Reset</Text>
                </Pressable>
            </View>
            <Text style={styles.text}>Treats left: {selectedPet === 'pet1' ? pet1Treats : pet2Treats}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    petSelector: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        width: '60%',
    },
    petSelectorButton: {
        backgroundColor: '#add8e6',
        borderRadius: 20,
        padding: 10,
        paddingHorizontal: 20,
        marginHorizontal: 10,
        elevation: 2,
        shadowOffset: { width: 1, height: 1 },
        shadowColor: "#333",
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    petSelectorButtonActive: {
        backgroundColor: 'red', // Highlight the active pet selector button
        borderRadius: 20,
        padding: 10,
        paddingHorizontal: 20,
        marginHorizontal: 10,
        elevation: 2,
        shadowOffset: { width: 1, height: 1 },
        shadowColor: "#333",
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    text: {
        fontSize: 20,
        textAlign: 'center',
        marginVertical: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    button: {
        margin: 10,
        backgroundColor: 'skyblue',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowOffset: { width: 1, height: 1 },
        shadowColor: "#333",
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
    petImage: {
        width: 200,
        height: 200,
        borderRadius: 100,
        marginBottom: 20,
        borderWidth: 3,
        borderColor: '#ddd',
    },
});
