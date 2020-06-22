import React, { useState, useEffect, useCallback } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const foodsList = await api.get<IFoodPlate[]>('/foods');

      setFoods(foodsList.data);
    }

    loadFoods();
  }, []);

  const handleAddFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>) => {
      try {
        const foodData = {
          ...food,
          available: true,
        };

        const response = await api.post('/foods', foodData);

        setFoods([...foods, response.data]);
      } catch (err) {
        // eslint-disable-next-line
        console.log(err);
      }
    },
    [setFoods, foods],
  );

  const handleUpdateFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>) => {
      try {
        const foodData = {
          id: editingFood.id,
          ...food,
          available: editingFood.available,
        };

        await api.put(`/foods/${foodData.id}`, foodData);

        const listFoods = foods.map(foodCurrent => {
          if (foodCurrent.id !== editingFood.id) {
            return foodCurrent;
          }

          return foodData;
        });

        setFoods(listFoods);
      } catch (err) {
        // eslint-disable-next-line
        console.log(err);
      }
    },
    [editingFood, foods],
  );

  const handleDeleteFood = useCallback(
    async (id: number) => {
      await api.delete(`/foods/${id}`);

      const foodsList = foods.filter(foodCurrent => foodCurrent.id !== id);

      setFoods(foodsList);
    },
    [setFoods, foods],
  );

  const toggleModal = useCallback(() => {
    setModalOpen(!modalOpen);
  }, [setModalOpen, modalOpen]);

  const toggleEditModal = useCallback(() => {
    setEditModalOpen(!editModalOpen);
  }, [setEditModalOpen, editModalOpen]);

  const handleEditFood = useCallback(
    (food: IFoodPlate) => {
      setEditingFood(food);
      toggleEditModal();
    },
    [setEditingFood, toggleEditModal],
  );

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
