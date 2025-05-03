import React, { useEffect, useState } from "react";
import { useGetProductsQuery } from "../context/service/products.service";
import { useGetUsersQuery } from "../context/service/user.service";
import { useCreateSaleMutation } from "../context/service/sale.service";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Typography,
  Table,
} from "antd";
import { FaPlus, FaX } from "react-icons/fa6";

const { Title, Text } = Typography;

export default function Order() {
  const { data: products = [], isLoading } = useGetProductsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const [createSale] = useCreateSaleMutation();
  const [basket, setBasket] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [form] = Form.useForm();
  const distributorId = localStorage.getItem("userId");

  const packageTypes = {
    piece: "Dona",
    box: "Quti",
  };

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const handleSubmit = async (values) => {
    if (basket.length === 0) return message.error("Mahsulotlar tanlanmagan");

    const data = {
      clientId: values.clientId,
      distributorId,
      status: "pending", // ✅ Manager tasdiqlashi uchun
      products: basket.map((item) => ({
        productId: item._id,
        sellingPrice: item.unitSellingPrice,
        quantity: item.totalPieceQuantity,
      })),
    };

    try {
      await createSale(data).unwrap();
      message.success("Zakas yuborildi. Manager tasdiqlashi kutilmoqda.");
      form.resetFields();
      setBasket([]);
    } catch (error) {
      console.error(error);
      message.error("Xatolik yuz berdi");
    }
  };

  const columns = [
    {
      title: "Mahsulot",
      dataIndex: "productTypeId",
      render: (text) => text.name,
    },
    {
      title: "Turi",
      dataIndex: "productTypeId",
      render: (text) => packageTypes[text.packageType],
    },
    { title: "Dona", dataIndex: "totalPieceQuantity" },
    {
      title: "Quti(dona)",
      dataIndex: "productTypeId",
      render: (text) =>
        text.packageType === "box" ? text.pieceQuantityPerBox : "-",
    },
    { title: "Narxi", dataIndex: "unitSellingPrice" },
    {
      title: "Tanlash",
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          onClick={() =>
            basket.find((b) => b._id === record._id)
              ? message.warning("Mahsulot allaqachon tanlangan")
              : setBasket([...basket, record])
          }
        >
          <FaPlus />
        </Button>
      ),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        gap: "10px",
        height: "100vh",
        overflowY: "auto",
        background: "#fff",
        maxWidth: 450,
        margin: "0 auto",
      }}
    >
      {/* 🔽 Tanlangan mahsulotlar */}
      <Space
        direction="vertical"
        style={{
          width: "100%",
          maxHeight: 230,
          overflowY: "auto",
          paddingBottom: 10,
        }}
      >
        {basket.length > 0 ? (
          basket.map((item) => (
            <Card key={item._id} size="small">
              <Row gutter={8} align="middle">
                <Col span={24}>
                  <Title level={5} style={{ marginBottom: 5 }}>
                    {item.productTypeId.name}
                  </Title>
                </Col>
                <Col span={14}>
                  <Text style={{ fontSize: 12 }}>
                    {packageTypes[item.productTypeId.packageType]} soni
                  </Text>
                  <Input
                    size="small"
                    type="number"
                    min={1}
                    max={item.totalPieceQuantity}
                    value={
                      item.productTypeId.packageType === "box"
                        ? item.totalPieceQuantity /
                          item.productTypeId.pieceQuantityPerBox
                        : item.totalPieceQuantity
                    }
                    onChange={(e) => {
                      const newVal = Number(e.target.value);
                      const updated = basket.map((b) =>
                        b._id === item._id
                          ? {
                              ...b,
                              totalPieceQuantity:
                                item.productTypeId.packageType === "box"
                                  ? newVal *
                                    item.productTypeId.pieceQuantityPerBox
                                  : newVal,
                            }
                          : b
                      );
                      setBasket(updated);
                    }}
                  />
                </Col>
                <Col span={10}>
                  <Button
                    size="small"
                    danger
                    onClick={() =>
                      setBasket(basket.filter((b) => b._id !== item._id))
                    }
                    style={{ marginTop: 22 }}
                    block
                  >
                    <FaX />
                  </Button>
                </Col>
              </Row>
            </Card>
          ))
        ) : (
          <Text>Mahsulotlar tanlanmagan</Text>
        )}
      </Space>

      {/* 🔽 Xaridorni tanlash va zakas yuborish formasi */}
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        style={{ width: "100%" }}
      >
        <Form.Item
          name="clientId"
          label="Xaridor"
          rules={[{ required: true, message: "Xaridor tanlanmagan" }]}
        >
          <Select
            placeholder="Xaridorni tanlang"
            style={{ width: "100%" }}
            options={users
              .filter((u) => u.role === "client")
              .map((u) => ({ label: u.fullname, value: u._id }))}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Zakas yuborish
          </Button>
        </Form.Item>
      </Form>

      {/* 🔽 Mahsulotlar qidiruvi */}
      <Input
        placeholder="Mahsulot qidirish"
        onChange={(e) => {
          const val = e.target.value.toLowerCase();
          setFilteredProducts(
            products.filter((p) =>
              p.productTypeId.name.toLowerCase().includes(val)
            )
          );
        }}
        style={{ marginBottom: 5 }}
      />

      {/* 🔽 Mahsulotlar jadvali */}
      <div style={{ overflowX: "auto" }}>
        <Table
          size="small"
          columns={columns}
          dataSource={filteredProducts}
          loading={isLoading}
          rowKey="_id"
          pagination={false}
          scroll={{ x: 500 }}
        />
      </div>
    </div>
  );
}
