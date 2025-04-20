import { FaIceCream } from "react-icons/fa";
import { FaCoins } from "react-icons/fa";
import { TiShoppingCart } from "react-icons/ti";
import { AiFillProduct } from "react-icons/ai";
import { IoMdDocument } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { FaShop } from "react-icons/fa6";

export const menuItems = [
    {
        icon: <AiFillProduct />,
        path: '/',
        label: "Ombor"
    },
    {
        icon: <FaIceCream />,
        path: '/product-types',
        label: "Mahsulot turlari"
    },
    {
        icon: <TiShoppingCart />,
        path: '/sale',
        label: "Sotuv"
    },
    {
        icon: <IoMdDocument />,
        path: '/sale-history',
        label: "Sotuv tarixi"
    },
    {
        icon: <FaCoins />,
        path: '/debt',
        label: "Qarzdorlar"
    },
    {
        icon: <FaUser />,
        path: '/distributors',
        label: "Agentlar"
    },
    {
        icon: <FaShop />,
        path: '/clients',
        label: "Xaridorlar"
    },
];
