import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

type holiday = {
    name: string;
    date: string;
}

export type Contact = {
    id: string;
    firstName: string;
    lastName: string;
    birthday: Date; 
    holidays: holiday[];
    photoUri?: string;
}

export const useContacts = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    
    const loadContacts = async () => {
        try {
            const contactData = await AsyncStorage.getItem("@contacts");
            if (contactData) {
                const parsedContacts = JSON.parse(contactData) as Contact[];
                return parsedContacts.map(contact => ({
                    ...contact,
                    birthday: new Date(contact.birthday)
                }));
            }
            return [];
        } catch (error) {
            console.error('Failed to load contacts:', error);
            return [];
        }
    };
    
    const refreshContacts = useCallback(async () => {
        const loadedContacts = await loadContacts();
        setContacts(loadedContacts);
    }, []); // Empty dependency array if loadContacts is stable/imported

    useEffect(() => {
        refreshContacts();
    }, [refreshContacts]); // This is now safe because refreshContacts is stable

    const addContact = async (newContact: Contact) => {
        try {
            const updatedContacts = [...contacts, newContact];
            setContacts(updatedContacts);
            await AsyncStorage.setItem("@contacts", JSON.stringify(updatedContacts));
        } catch (error) {
            console.error('Failed to add contact:', error);
        }
    };

    const removeContact = async (id: string) => {
        try {
            const updatedContacts = contacts.filter(contact => contact.id !== id);
            setContacts(updatedContacts);
            await AsyncStorage.setItem("@contacts", JSON.stringify(updatedContacts));
        } catch (error) {
            console.error('Failed to remove contact:', error);
        }
    };

    return { contacts, addContact, removeContact, refreshContacts };
}