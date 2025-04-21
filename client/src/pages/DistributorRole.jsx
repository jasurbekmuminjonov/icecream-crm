import React, { useState } from 'react';
import { useDeliverSaleMutation, useGetSalesQuery, usePaymentSaleMutation } from '../context/service/sale.service';
import { Button, Card, Col, Row, Space, Form, message, Modal, Input, Table } from 'antd';
import { FaBoxes, FaCheck, FaDollarSign } from 'react-icons/fa';
const DistributorRole = () => {
    const { data: sales = [], isLoading, refetch } = useGetSalesQuery();
    const [form] = Form.useForm();
    const [deliverSale] = useDeliverSaleMutation();
    const [actionType, setActionType] = useState("");
    const [paymentSale] = usePaymentSaleMutation();
    const [productsModal, setProductsModal] = useState(false);
    const [modalProducts, setModalProducts] = useState([]);
    const [paymentModal, setPaymentModal] = useState(false);
    const userId = localStorage.getItem('userId');
    const [selectedItem, setSelectedItem] = useState("");
    const userSales = sales.filter(sale => sale.distributorId._id === userId);
    const statusTypes = {
        inprogress: "Jarayonda",
        delivered: "Yetkazilgan"
    }
    const actionTypes = {
        payment: "To'lov qilish",
        deliver: "Yetkazishni belgilash"
    }
    async function handlePayment(values) {
        try {
            const data = {
                paymentAmount: Number(values.paymentAmount),
            }
            if (actionType === "deliver") {
                await deliverSale({ id: selectedItem, body: data }).unwrap()
            } else {
                await paymentSale({ id: selectedItem, body: data }).unwrap()
            }
            message.success(actionType === "deliver" ? "Yetkazilganlik muvaffaqiyatli belgilandi" : "To'lov muvaffaqiyatli amalga oshirildi")
            form.resetFields()
            setSelectedItem("")
            setActionType("")
            setPaymentModal(false)
            refetch()

        } catch (error) {
            console.log(error)
            message.error("Xatolik yuz berdi")
        }

    }
    const packageTypes = {
        piece: "Dona",
        box: "Quti"
    }
    return (
        <div className='distributor-role'>
            <Modal open={paymentModal} onCancel={() => {
                setPaymentModal(false)
                form.resetFields()
                setSelectedItem("")
                setActionType("")
            }} title={actionTypes[actionType]} footer={[]}>
                <Form form={form} onFinish={handlePayment} layout='vertical'>
                    <Form.Item name="paymentAmount" label="To'lov miqdori" rules={[{ required: true, message: "To'lov miqdorini kiriting" }]}>
                        <Input type="number" placeholder='100000' />
                    </Form.Item>
                    <Button htmlType='submit' type='primary'>Saqlash</Button>
                </Form>
            </Modal>
            <Modal open={productsModal} onCancel={() => {
                setProductsModal(false)
                setModalProducts([])
            }} title="Mahsulotlar" footer={[]}>
                <Table style={{ overflowX: "auto" }} dataSource={modalProducts} columns={[
                    { title: "Tovar", dataIndex: "productName" },
                    { title: "Qadoq turi", dataIndex: "productId", render: (text) => packageTypes[text.productTypeId.packageType] },
                    { title: "Sotilgan miqdor", dataIndex: "quantity" },
                    { title: "Sotilgan quti soni", render: (_, record) => record.productId.productTypeId.packageType === "box" ? record.quantity / record.productId.productTypeId.pieceQuantityPerBox : "-" },
                    { title: "Sotilgan narx", dataIndex: "sellingPrice" },
                    { title: "Jami to'lov", render: (_, record) => (record.sellingPrice * record.quantity).toLocaleString() },
                ]} />
            </Modal>
            <Space style={{ width: "100%", padding: '5px 0', overflowY: "auto" }} direction='vertical'>
                {userSales.filter(sale => !(sale.isDebt === false && sale.status === 'delivered')).length < 1 ? (<p>Sotuvlar bo'sh</p>) : userSales.filter(sale => !(sale.isDebt === false && sale.status === 'delivered'))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((sale, index) => (
                        <Card key={sale._id}>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <p style={{ display: 'flex', flexDirection: 'column' }}>Xaridor: <strong>{sale.clientId.fullname}</strong></p>
                                </Col>
                                <Col span={12}>
                                    <p style={{ display: 'flex', flexDirection: 'column' }}>Telefon: <strong>{sale.clientId.phone}</strong></p>
                                </Col>
                            </Row>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <p style={{ display: 'flex', flexDirection: 'column' }}>Umumiy to'lov: <strong>{sale.totalAmountToPaid.toLocaleString()}</strong></p>
                                </Col>
                                <Col span={12}>
                                    <p style={{ display: 'flex', flexDirection: 'column' }}>Qoldiq to'lov: <strong>{(sale.totalAmountToPaid - sale.totalAmountPaid).toLocaleString()}</strong></p>
                                </Col>
                            </Row>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <p style={{ display: 'flex', flexDirection: 'column' }}>Holat: <strong>{statusTypes[sale.status]}</strong></p>
                                </Col>
                                <Col style={{ display: "flex", alignItems: "end" }} span={12}>
                                    <Space>
                                        <Button onClick={() => {
                                            setSelectedItem(sale._id)
                                            setPaymentModal(true)
                                            setActionType("deliver")
                                        }} type='primary' disabled={sale.status === 'delivered'}>
                                            <FaCheck />
                                        </Button>
                                        <Button onClick={() => {
                                            setSelectedItem(sale._id)
                                            setPaymentModal(true)
                                            setActionType("payment")
                                        }} type='primary' disabled={sale.status === 'inprogress'}>
                                            <FaDollarSign />
                                        </Button>
                                        <Button onClick={() => {
                                            setProductsModal(true)
                                            setModalProducts(sale.products)
                                        }} type='primary'>
                                            <FaBoxes />
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>
                    ))}
            </Space>
        </div>
    );
};

export default DistributorRole;