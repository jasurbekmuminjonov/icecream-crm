import React, { useEffect, useState } from 'react';
import { useGetProductsQuery } from '../context/service/products.service';
import { Button, Card, Col, Input, message, Row, Space, Table, Typography, Form, Select } from 'antd'
import { useGetProductTypesQuery } from '../context/service/productType.service';
import moment from 'moment';
import { FaPlus } from 'react-icons/fa';
import { FaX } from 'react-icons/fa6';
import { useCreateUserMutation, useGetUsersQuery } from '../context/service/user.service';
import { useCreateSaleMutation } from '../context/service/sale.service';
const { Title, Text } = Typography;
const Sale = () => {
    const { data: products = [], isLoading, refetch } = useGetProductsQuery();
    const { data: users = [] } = useGetUsersQuery()
    const [form] = Form.useForm();
    const [filteredProducts, setFilteredProducts] = useState(products)
    const [createSale] = useCreateSaleMutation()
    const [createUser] = useCreateUserMutation()
    const [basket, setBasket] = useState([])
    const packageTypes = {
        piece: "Dona",
        box: "Quti"
    }
    useEffect(() => {
        setFilteredProducts(products)
    }, [products])

    const productsColumns = [
        { title: "Mahsulot nomi", dataIndex: "productTypeId", render: (text) => text.name },
        { title: "Qadoq turi", dataIndex: "productTypeId", render: (text) => packageTypes[text.packageType] },
        { title: "Jami dona soni", dataIndex: "totalPieceQuantity" },
        { title: "Qutidagi dona soni", dataIndex: "productTypeId", render: (text) => text.packageType === "piece" ? "-" : text.pieceQuantityPerBox },
        { title: "Jami quti soni", dataIndex: "productTypeId", render: (text, record) => text.packageType === "piece" ? "-" : (record.totalPieceQuantity / text.pieceQuantityPerBox).toFixed(2) },
        { title: "Sotish narxi", dataIndex: "unitSellingPrice" },
        { title: "Kiritilgan sana", dataIndex: "createdAt", render: (text) => moment(text).format("DD.MM.YYYY") },
        { title: "Tanlash", render: (_, record) => (<Button type='primary' onClick={() => basket.find(item => item._id === record._id) ? message.error("Mahsulot allaqachon tanlangan") : setBasket([...basket, record])}><FaPlus /></Button>) },
    ]
    async function handleSubmit(values) {
        try {
            if (basket.length === 0) return message.error("Tanlangan mahsulotlar yo'q")
            const data = {
                clientId: values.clientId,
                distributorId: values.distributorId,
                products: basket.map(item => ({
                    productId: item._id,
                    sellingPrice: item.unitSellingPrice,
                    quantity: item.totalPieceQuantity
                }))
            }
            await createSale(data).unwrap()
            message.success("Sotuv muvaffaqiyatli amalga oshirildi")
            setBasket([])
            form.resetFields()
            refetch()
        } catch (error) {
            message.error("Xatolik yuz berdi")
            console.log(error);
        }

    }
    return (
        <div className='sale' style={{ display: "flex", height: "100%" }}>
            <div style={{ width: "60%", borderRight: "1px solid #ccc", padding: "0 5px" }}>
                <Input
                    onChange={(e) => {
                        const value = e.target.value.toLowerCase();
                        setFilteredProducts(
                            products.filter((item) => item.productTypeId.name.toLowerCase().includes(value))
                        );
                    }}
                    placeholder='Mahsulot qidirish'
                    style={{ margin: "10px 0" }}
                />
                <Table style={{ overflowX: "auto" }} columns={productsColumns} dataSource={filteredProducts} loading={isLoading} />
            </div>
            <div style={{ width: "40%", minHeight: "100%", padding: "5px 5px", display: "flex", flexDirection: "column", gap: "5px" }}>
                <Space direction='vertical' style={{ width: "100%", height: "65%", overflowY: "auto" }}>
                    {basket.length > 0 ? basket.map((item) => (
                        <Card key={item._id}>
                            <Row style={{ alignItems: "end" }} gutter={24} align="middle">
                                <Col span={7}>
                                    <Title level={5}>{item.productTypeId.name}</Title>
                                </Col>
                                <Col span={7}>
                                    <p>Sotish narxi</p>
                                    <Input
                                        type="number"
                                        value={item.unitSellingPrice}
                                        max={item.unitSellingPrice}
                                        min={1}
                                        onChange={(e) => {
                                            const newBasket = basket.map(b => b._id === item._id ? { ...b, unitSellingPrice: Number(e.target.value) } : b)
                                            setBasket(newBasket)
                                        }}
                                    />
                                </Col>
                                <Col span={7}>
                                    <p>Sotilayotgan soni</p>
                                    <Input
                                        type="number"
                                        value={item.totalPieceQuantity}
                                        max={item.totalPieceQuantity}
                                        min={1}
                                        onChange={(e) => {
                                            const newBasket = basket.map(b => b._id === item._id ? { ...b, totalPieceQuantity: Number(e.target.value) } : b)
                                            setBasket(newBasket)
                                        }}
                                    />
                                </Col>
                                <Col span={3}>
                                    <Button danger type='primary' onClick={() => setBasket(basket.filter(b => b._id !== item._id))}>
                                        <FaX />
                                    </Button>
                                </Col>
                            </Row>
                        </Card>

                    )) : (
                        <Text level={5} style={{ textAlign: "center" }}>Tanlangan mahsulotlar yo'q</Text>
                    )}
                </Space>
                <Form onFinish={handleSubmit} style={{ height: "35%", padding: "5px 0", borderTop: "1px solid #ccc" }} form={form} layout='vertical'>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Xaridor" name="clientId" rules={[{ required: true, message: "Xaridorni tanlang" }]}>
                                <Select
                                    placeholder='Xaridorni tanlang'
                                    options={users.filter(user => user.role === "client").map(user => ({ label: user.fullname, value: user._id }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Agent" name="distributorId" rules={[{ required: true, message: "Agentni tanlang" }]}>
                                <Select
                                    placeholder='Agentni tanlang'
                                    options={users.filter(user => user.role === "distributor").map(user => ({ label: user.fullname, value: user._id }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item>
                                <Button htmlType='submit' type='primary'>Sotish</Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>
        </div>
    );
};


export default Sale;