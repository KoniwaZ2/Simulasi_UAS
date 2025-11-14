import axios from "axios";

const API_URL = "http://localhost:8000/api/"

export const getCart = async (userId, token) => {
    try {
        const response = await axios.get(`${API_URL}cart-items/?user=${userId}`, {
