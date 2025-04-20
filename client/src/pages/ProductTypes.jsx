import React, { useState } from 'react';
import {
    Tabs,
    Table,
    Form,
    Input,
    Button,
    message,
    Row,
    Col,
    Select,
    Space,
    Popconfirm,
} from "antd";
import { useCreateProductTypeMutation, useDeleteProductTypeMutation, useGetProductTypesQuery, useUpdateProductTypeMutation } from '../context/service/productType.service';
import { MdDeleteForever, MdEdit } from "react-icons/md";

const ProductTypes = () => {
    const [form] = Form.useForm();
    const [createProductType] = useCreateProductTypeMutation()
    const [updateProductType] = useUpdateProductTypeMutation()
    const [deleteProductType] = useDeleteProductTypeMutation()
    const { data: productType = [], isLoading } = useGetProductTypesQuery()
    const [currentTab, setCurrentTab] = useState('1')
    const [selectedItem, setSelectedItem] = useState("");
    const packageTypes = {
        piece: "Dona",
        box: "Quti"
    }
    const columns = [
        { title: "Mahsulot nomi", dataIndex: "name" },
        { title: "Qadoq turi", dataIndex: "packageType", render: (text) => packageTypes[text] },
        { title: "Qutidagi dona soni", dataIndex: "pieceQuantityPerBox", render: (text, record) => record.packageType === 'piece' ? "-" : text },
        {
            title: "Amallar", render: (_, record) => (
                <Space>
                    <Button
                        onClick={() => {
                            setSelectedItem(record._id);
                            form.setFieldsValue({
                                name: record.name,
                                packageType: record.packageType,
                                pieceQuantityPerBox: record.pieceQuantityPerBox,
                            });
                            setCurrentTab("2");
                        }}
                        type="primary"
                        style={{ background: "#f4a62a" }}
                        icon={<MdEdit />}
                    ></Button>
                    <Popconfirm
                        onConfirm={() => handleDelete(record._id)}
                        title="Chindan ham mahsulot turini butunlay o'chirmoqchimisiz?"
                        onCancel={() => { }}
                    >
                        <Button type="primary" danger icon={<MdDeleteForever />}></Button>
                    </Popconfirm>
                </Space>
            )
        }
    ]
    const handleDelete = async (id) => {
        try {
            await deleteProductType(id).unwrap();
            message.success("Mahsulot turi muvaffaqiyatli o'chirildi");
        } catch (error) {
            message.error("Mahsulot turini o'chirishda xatolik: " + error.data.message);
        }
    }
    const onFinish = async (values) => {
        try {
            let data = {
                name: values.name,
                packageType: values.packageType,
                pieceQuantityPerBox: Number(values.pieceQuantityPerBox)
            };
            let res;
            if (selectedItem) {
                res = await updateProductType({ id: selectedItem, body: data });
            } else {
                res = await createProductType(data).unwrap();
            }
            if (selectedItem) {
                message.success("Mahsulot turi muvaffaqiyatli tahrirlandi");
            } else {
                message.success("Mahsulot turi muvaffaqiyatli qo'shildi");
            }
            setSelectedItem("");
            form.resetFields();
            setCurrentTab("1");
        } catch (error) {
            message.error("Mahsulot turini qo'shishda xatolik: " + error.data.message);
        }
    };
    return (
        <div className='producttypes'>
            <Tabs activeKey={currentTab}
                onChange={(key) => {
                    setCurrentTab(key);
                    form.resetFields();
                }}
            >
                <Tabs.TabPane tab="Mahsulotlari turi" key="1">
                    <Table style={{ overflowX: "auto" }} size="small" dataSource={productType} loading={isLoading} columns={columns} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Mahsulot turi qo'shish" key="2">
                    <Form
                        autoComplete='off'
                        layout="vertical"
                        onFinish={onFinish}
                        form={form}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Mahsulot nomi"
                                    name={"name"}
                                    rules={[
                                        { required: true, message: "Mahsulot nomini kiritish shart" }
                                    ]}
                                >
                                    <Input placeholder='Magnat 85gr' />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Qadoq turi"
                                    name={"packageType"}
                                    rules={[
                                        { required: true, message: "Qadoq turi tanlanishi shart" }
                                    ]}
                                >
                                    <Select>
                                        <Select.Option value="piece">Dona</Select.Option>
                                        <Select.Option value="box">Quti</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    shouldUpdate={(prev, next) => prev.packageType !== next.packageType}
                                >
                                    {({ getFieldValue }) => {
                                        const isBox = getFieldValue("packageType") === "box";
                                        return (
                                            <Form.Item
                                                label="Qutidagi dona soni"
                                                name="pieceQuantityPerBox"
                                                rules={
                                                    isBox
                                                        ? [{ required: true, message: "Qutidagi dona sonini kiritish shart" }]
                                                        : []
                                                }
                                            >
                                                <Input
                                                    placeholder="25"
                                                    type="number"
                                                    disabled={!isBox}
                                                />
                                            </Form.Item>
                                        );
                                    }}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item>
                                    <Button type='primary' htmlType='submit'>Saqlash</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
};


export default ProductTypes;