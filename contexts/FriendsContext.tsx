import React, { createContext, ReactNode, useContext, useState } from 'react';

interface FriendsContextType {
  isAddModalVisible: boolean;
  setIsAddModalVisible: (visible: boolean) => void;
  isAddHolidayModalVisible: boolean;
  setIsAddHolidayModalVisible: (visible: boolean) => void;
  isUpcomingHolidaysModalVisible: boolean;
  setIsUpcomingHolidaysModalVisible: (visible: boolean) => void;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider = ({ children }: { children: ReactNode }) => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isAddHolidayModalVisible, setIsAddHolidayModalVisible] = useState(false);
  const [isUpcomingHolidaysModalVisible, setIsUpcomingHolidaysModalVisible] = useState(false);

  return (
    <FriendsContext.Provider value={{ 
      isAddModalVisible, 
      setIsAddModalVisible,
      isAddHolidayModalVisible,
      setIsAddHolidayModalVisible,
      isUpcomingHolidaysModalVisible,
      setIsUpcomingHolidaysModalVisible
    }}>
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriendsContext = () => {
  const context = useContext(FriendsContext);
  if (context === undefined) {
    throw new Error('useFriendsContext must be used within a FriendsProvider');
  }
  return context;
};