import React, { createContext, ReactNode, useContext, useState } from 'react';

interface FriendsContextType {
  isAddModalVisible: boolean;
  setIsAddModalVisible: (visible: boolean) => void;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider = ({ children }: { children: ReactNode }) => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  return (
    <FriendsContext.Provider value={{ isAddModalVisible, setIsAddModalVisible }}>
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