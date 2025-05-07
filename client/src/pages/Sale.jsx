import React, { useEffect, useState } from "react";
import { useGetProductsQuery } from "../context/service/products.service";
import {
  Button,
  Card,
  Col,
  Input,
  message,
  Row,
  Space,
  Table,
  Typography,
  Form,
  Select,
  Modal,
  Tabs,
  Badge,
  Drawer,
} from "antd";
import moment from "moment";
import { FaAsterisk, FaPlus, FaShoppingCart, FaSearch } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import {
  useCreateUserMutation,
  useGetUsersQuery,
} from "../context/service/user.service";
import { useCreateSaleMutation } from "../context/service/sale.service";
import { useGetProductTypesQuery } from "../context/service/productType.service";
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Sale = () => {
  const { data: products = [], isLoading, refetch } = useGetProductsQuery();
  const { data: users = [], refetch: userRefetch } = useGetUsersQuery();
  const [userType, setUserType] = useState("");
  const [userCreateModal, setUserCreateModal] = useState(false);
  const [userCreateForm] = Form.useForm();
  const [form] = Form.useForm();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const { data: productTypeData = [] } = useGetProductTypesQuery();
  const [createSale] = useCreateSaleMutation();
  const [createUser] = useCreateUserMutation();
  const [basket, setBasket] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeTab, setActiveTab] = useState("products");
  const [basketDrawerVisible, setBasketDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const packageTypes = {
    piece: "Dona",
    box: "Quti",
  };

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const productsColumns = [
    {
      title: "Mahsulot",
      dataIndex: "productTypeId",
      render: (text) => text.name,
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "Qadoq",
      dataIndex: "productTypeId",
      render: (text) => packageTypes[text.packageType],
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Dona",
      dataIndex: "totalPieceQuantity",
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Narx",
      dataIndex: "unitSellingPrice",
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            if (basket.find((item) => item._id === record._id)) {
              message.error("Mahsulot allaqachon tanlangan");
            } else {
              setBasket([...basket, record]);
              if (isMobile) {
                message.success(
                  `${record.productTypeId.name} savatchaga qo'shildi`
                );
              }
            }
          }}
        >
          <FaPlus />
        </Button>
      ),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
  ];

  // Smaller table for mobile view
  const mobileProductsColumns = [
    {
      title: "Mahsulot",
      dataIndex: "productTypeId",
      render: (text, record) => (
        <div>
          <div>
            <strong>{text.name}</strong>
          </div>
          <div>Narx: {record.unitSellingPrice} so'm</div>
        </div>
      ),
    },
    {
      title: "",
      width: 50,
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            if (basket.find((item) => item._id === record._id)) {
              message.error("Mahsulot allaqachon tanlangan");
            } else {
              setBasket([...basket, record]);
              message.success(
                `${record.productTypeId.name} savatchaga qo'shildi`
              );
            }
          }}
        >
          <FaPlus />
        </Button>
      ),
    },
  ];

  async function handleSubmit(values) {
    try {
      if (basket.length === 0)
        return message.error("Tanlangan mahsulotlar yo'q");
      const data = {
        clientId: values.clientId,
        distributorId: values.distributorId,
        products: basket.map((item) => ({
          productId: item._id,
          sellingPrice: item.unitSellingPrice,
          quantity: item.totalPieceQuantity,
        })),
      };
      const res = await createSale(data).unwrap();
      message.success("Sotuv muvaffaqiyatli amalga oshirildi");
      setBasket([]);
      form.resetFields();
      refetch();
      setFilteredProducts(products);
      if (isMobile) {
        setBasketDrawerVisible(false);
      }
      generateInvoice(res.record);
    } catch (error) {
      message.error("Xatolik yuz berdi");
      console.log(error);
    }
  }

  function generateInvoice(record) {
    const invoiceWindow = window.open("", "_blank");
    const invoiceHTML = `
            <html>
            <head>
                <title>Hisob-faktura</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        box-sizing: border-box;
                    }
                    h1 {
                        text-align: center;
                        font-size: 22px;
                    }
                    .info {
                        display: flex;
                        flex-direction: column;
                        margin-top: 20px;
                        font-size: 14px;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        border: 1px solid #333;
                        padding: 6px;
                        text-align: left;
                        font-size: 12px;
                    }
                    .totals {
                        margin-top: 20px;
                        font-size: 14px;
                    }
                    .totals div {
                        margin-bottom: 5px;
                    }
                    @media print {
                        body {
                            width: 100%;
                            padding: 10px;
                        }
                    }
                </style>
            </head>
            <body>
                <h1>Hisob-faktura</h1>
                <div class="info">
                    <div class="info-row">
                        <div>
                            <strong>Xaridor:</strong> ${
                              record.clientId.fullname
                            }<br>
                            <strong>Telefon:</strong> ${record.clientId.phone}
                        </div>
                        <div>
                            <strong>Agent:</strong> ${
                              record.distributorId.fullname
                            }<br>
                            <strong>Telefon:</strong> ${
                              record.distributorId.phone
                            }
                        </div>
                    </div>
                </div>
        
                <table>
                    <thead>
                        <tr>
                            <th>Mahsulot</th>
                            <th>Narxi</th>
                            <th>Soni</th>
                            <th>Jami</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${record.products
                          .map((product) => {
                            const total =
                              product.sellingPrice * product.quantity;
                            return `
                                <tr>
                                    <td>${product.productName}</td>
                                    <td>${product.sellingPrice.toLocaleString()} so'm</td>
                                    <td>${product.quantity}</td>
                                    <td>${total.toLocaleString()} so'm</td>
                                </tr>
                            `;
                          })
                          .join("")}
                    </tbody>
                </table>
        
                <div class="totals">
                    <div><strong>Jami to'lov:</strong> ${record.totalAmountToPaid.toLocaleString()} so'm</div>
                    <div><strong>To'langan:</strong> ${record.totalAmountPaid.toLocaleString()} so'm</div>
                    <div><strong>Qoldiq:</strong> ${(
                      record.totalAmountToPaid - record.totalAmountPaid
                    ).toLocaleString()} so'm</div>
                    <div><strong>Sotilgan sana:</strong> ${moment(
                      record.createdAt
                    ).format("DD.MM.YYYY")}</div>
                </div>
        
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>`;

    invoiceWindow.document.open();
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
  }

  async function handleUserCreate(values) {
    try {
      await createUser({ ...values, role: userType }).unwrap();
      message.success("Foydalanuvchi muvaffaqiyatli yaratildi");
      setUserCreateModal(false);
      userCreateForm.resetFields();
      userRefetch();
    } catch (error) {
      message.error("Xatolik yuz berdi");
      console.log(error);
    }
  }

  const renderBasketItems = () => (
    <Space
      direction="vertical"
      style={{
        width: "100%",
        height: isMobile ? "auto" : "65%",
        overflowY: "auto",
      }}
    >
      {basket.length > 0 ? (
        basket.map((item) => (
          <Card key={item._id} style={{ marginBottom: "10px" }}>
            {isMobile ? (
              <>
                <div style={{ marginBottom: "10px" }}>
                  <Title level={5}>{item.productTypeId.name}</Title>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <Text>Sotish narxi</Text>
                  <Input
                    type="number"
                    value={item.unitSellingPrice}
                    max={item.unitSellingPrice}
                    min={1}
                    onChange={(e) => {
                      const newBasket = basket.map((b) =>
                        b._id === item._id
                          ? { ...b, unitSellingPrice: Number(e.target.value) }
                          : b
                      );
                      setBasket(newBasket);
                    }}
                    style={{ marginTop: "5px" }}
                  />
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <Text>Sotilayotgan soni</Text>
                  <p>
                    <FaAsterisk size={8} color="orange" />
                    {item.productTypeId.packageType === "box"
                      ? "Quti soni"
                      : "Dona soni"}
                  </p>
                  <Input
                    type="number"
                    value={
                      item.productTypeId.packageType === "box"
                        ? item.totalPieceQuantity /
                          item.productTypeId.pieceQuantityPerBox
                        : item.totalPieceQuantity
                    }
                    max={
                      item.productTypeId.packageType === "box"
                        ? item.totalPieceQuantity /
                          item.productTypeId.pieceQuantityPerBox
                        : item.totalPieceQuantity
                    }
                    min={1}
                    onChange={(e) => {
                      const newBasket = basket.map((b) =>
                        b._id === item._id
                          ? {
                              ...b,
                              totalPieceQuantity:
                                item.productTypeId.packageType === "box"
                                  ? Number(
                                      e.target.value *
                                        item.productTypeId.pieceQuantityPerBox
                                    )
                                  : Number(e.target.value),
                            }
                          : b
                      );
                      setBasket(newBasket);
                    }}
                    style={{ marginTop: "5px" }}
                  />
                </div>
                <Button
                  danger
                  type="primary"
                  onClick={() =>
                    setBasket(basket.filter((b) => b._id !== item._id))
                  }
                  style={{ width: "100%" }}
                >
                  <FaX /> O'chirish
                </Button>
              </>
            ) : (
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
                      const newBasket = basket.map((b) =>
                        b._id === item._id
                          ? { ...b, unitSellingPrice: Number(e.target.value) }
                          : b
                      );
                      setBasket(newBasket);
                    }}
                  />
                </Col>
                <Col span={7}>
                  <p>Sotilayotgan soni</p>
                  <p>
                    <FaAsterisk size={8} color="orange" />
                    {item.productTypeId.packageType === "box"
                      ? "Quti soni"
                      : "Dona soni"}
                  </p>
                  <Input
                    type="number"
                    value={
                      item.productTypeId.packageType === "box"
                        ? item.totalPieceQuantity /
                          item.productTypeId.pieceQuantityPerBox
                        : item.totalPieceQuantity
                    }
                    max={
                      item.productTypeId.packageType === "box"
                        ? item.totalPieceQuantity /
                          item.productTypeId.pieceQuantityPerBox
                        : item.totalPieceQuantity
                    }
                    min={1}
                    onChange={(e) => {
                      const newBasket = basket.map((b) =>
                        b._id === item._id
                          ? {
                              ...b,
                              totalPieceQuantity:
                                item.productTypeId.packageType === "box"
                                  ? Number(
                                      e.target.value *
                                        item.productTypeId.pieceQuantityPerBox
                                    )
                                  : Number(e.target.value),
                            }
                          : b
                      );
                      setBasket(newBasket);
                    }}
                  />
                </Col>
                <Col span={3}>
                  <Button
                    danger
                    type="primary"
                    onClick={() =>
                      setBasket(basket.filter((b) => b._id !== item._id))
                    }
                  >
                    <FaX />
                  </Button>
                </Col>
              </Row>
            )}
          </Card>
        ))
      ) : (
        <Text
          level={5}
          style={{ textAlign: "center", display: "block", padding: "20px 0" }}
        >
          Tanlangan mahsulotlar yo'q
        </Text>
      )}
    </Space>
  );

  const renderSaleForm = () => (
    <Form
      onFinish={handleSubmit}
      style={{
        height: isMobile ? "auto" : "35%",
        padding: "5px 0",
        borderTop: "1px solid #ccc",
      }}
      form={form}
      layout="vertical"
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        {isMobile ? (
          <>
            <Form.Item
              label="Xaridor"
              name="clientId"
              rules={[{ required: true, message: "Xaridorni tanlang" }]}
            >
              <Select
                placeholder="Xaridorni tanlang"
                options={users
                  .filter((user) => user.role === "client")
                  .map((user) => ({ label: user.fullname, value: user._id }))}
              />
            </Form.Item>
            <Button
              style={{ marginBottom: "15px", width: "100%" }}
              onClick={() => {
                setUserType("client");
                setUserCreateModal(true);
                userCreateForm.resetFields();
              }}
            >
              Xaridor qo'shish
            </Button>

            <Form.Item
              label="Agent"
              name="distributorId"
              rules={[{ required: true, message: "Agentni tanlang" }]}
            >
              <Select
                placeholder="Agentni tanlang"
                options={users
                  .filter((user) => user.role === "distributor")
                  .map((user) => ({ label: user.fullname, value: user._id }))}
              />
            </Form.Item>
            <Button
              style={{ marginBottom: "15px", width: "100%" }}
              onClick={() => {
                setUserType("distributor");
                setUserCreateModal(true);
                userCreateForm.resetFields();
              }}
            >
              Agent qo'shish
            </Button>

            <Form.Item>
              <Button
                htmlType="submit"
                type="primary"
                style={{ width: "100%" }}
              >
                Sotish
              </Button>
            </Form.Item>
          </>
        ) : (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Xaridor"
                  name="clientId"
                  rules={[{ required: true, message: "Xaridorni tanlang" }]}
                >
                  <Select
                    placeholder="Xaridorni tanlang"
                    options={users
                      .filter((user) => user.role === "client")
                      .map((user) => ({
                        label: user.fullname,
                        value: user._id,
                      }))}
                  />
                </Form.Item>
                <Button
                  variant="dashed"
                  onClick={() => {
                    setUserType("client");
                    setUserCreateModal(true);
                    userCreateForm.resetFields();
                  }}
                >
                  Xaridor qo'shish
                </Button>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Agent"
                  name="distributorId"
                  rules={[{ required: true, message: "Agentni tanlang" }]}
                >
                  <Select
                    placeholder="Agentni tanlang"
                    options={users
                      .filter((user) => user.role === "distributor")
                      .map((user) => ({
                        label: user.fullname,
                        value: user._id,
                      }))}
                  />
                </Form.Item>
                <Button
                  variant="dashed"
                  onClick={() => {
                    setUserType("distributor");
                    setUserCreateModal(true);
                    userCreateForm.resetFields();
                  }}
                >
                  Agent qo'shish
                </Button>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item>
                  <Button htmlType="submit" type="primary">
                    Sotish
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </>
        )}
      </Space>
    </Form>
  );

  // Mobile view components
  const renderMobileView = () => (
    <>
      {/* Fixed header with search and basket */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          padding: "10px",
          borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }}>
          <Input
            prefix={<FaSearch />}
            placeholder="Mahsulot qidirish"
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value.toLowerCase();
              setSearchQuery(value);
              setFilteredProducts(
                products.filter((item) =>
                  item.productTypeId.name.toLowerCase().includes(value)
                )
              );
            }}
          />
        </div>
        <Badge count={basket.length} offset={[-5, 5]}>
          <Button
            type="primary"
            icon={<FaShoppingCart />}
            onClick={() => setBasketDrawerVisible(true)}
            style={{ marginLeft: 10 }}
          />
        </Badge>
      </div>

      {/* Table of products */}
      <div style={{ padding: "10px" }}>
        <Table
          columns={mobileProductsColumns}
          dataSource={filteredProducts}
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </div>

      {/* Basket drawer */}
      <Drawer
        title={`Savatcha (${basket.length})`}
        placement="right"
        onClose={() => setBasketDrawerVisible(false)}
        open={basketDrawerVisible}
        width="100%"
        bodyStyle={{ padding: "10px", paddingBottom: "60px" }}
      >
        {renderBasketItems()}
        {renderSaleForm()}
      </Drawer>

      {/* User Create Modal */}
      <Modal
        open={userCreateModal}
        title={
          userType === "client"
            ? "Yangi xaridor qo'shish"
            : "Yangi agent qo'shish"
        }
        footer={[]}
        onCancel={() => {
          setUserType("");
          setUserCreateModal(false);
          userCreateForm.resetFields();
        }}
      >
        <Form
          form={userCreateForm}
          onFinish={handleUserCreate}
          layout="vertical"
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Form.Item
              label="To'liq ism"
              name={"fullname"}
              rules={[
                { required: true, message: "To'liq ismni kiritish shart" },
              ]}
            >
              <Input placeholder="Ali Valiyev" />
            </Form.Item>
            <Form.Item
              label="Telefon"
              name={"phone"}
              rules={[
                { required: true, message: "Telefon kiritish shart" },
                {
                  pattern: /^\+998[0-9]{9}$/,
                  message:
                    "Telefon raqami +998 bilan boshlanib, 9 ta raqam bo'lishi kerak",
                },
              ]}
            >
              <Input placeholder="+998901234567" />
            </Form.Item>
            {userType === "distributor" && (
              <Form.Item
                label="Parol"
                name={"password"}
                rules={[
                  { required: true, message: "Parolni kiritish shart" },
                  {
                    minLength: 4,
                    message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
                  },
                ]}
              >
                <Input type="password" placeholder="****" />
              </Form.Item>
            )}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: "100%" }}
              >
                Saqlash
              </Button>
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </>
  );

  // Desktop view
  const renderDesktopView = () => (
    <div style={{ display: "flex", height: "100%" }}>
      <div
        style={{
          width: "60%",
          borderRight: "1px solid #ccc",
          padding: "0 5px",
        }}
      >
        <Input
          prefix={<FaSearch />}
          onChange={(e) => {
            const value = e.target.value.toLowerCase();
            setFilteredProducts(
              products.filter((item) =>
                item.productTypeId.name.toLowerCase().includes(value)
              )
            );
          }}
          placeholder="Mahsulot qidirish"
          style={{ margin: "10px 0" }}
        />
        <Table
          style={{ overflowX: "auto" }}
          columns={productsColumns}
          dataSource={filteredProducts}
          loading={isLoading}
        />
      </div>
      <div
        style={{
          width: "40%",
          minHeight: "100%",
          padding: "5px 5px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        {renderBasketItems()}
        {renderSaleForm()}
      </div>

      <Modal
        open={userCreateModal}
        title={
          userType === "client"
            ? "Yangi xaridor qo'shish"
            : "Yangi agent qo'shish"
        }
        footer={[]}
        onCancel={() => {
          setUserType("");
          setUserCreateModal(false);
          userCreateForm.resetFields();
        }}
      >
        <Form
          form={userCreateForm}
          onFinish={handleUserCreate}
          layout="vertical"
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Form.Item
              label="To'liq ism"
              name={"fullname"}
              rules={[
                { required: true, message: "To'liq ismni kiritish shart" },
              ]}
            >
              <Input placeholder="Ali Valiyev" />
            </Form.Item>
            <Form.Item
              label="Telefon"
              name={"phone"}
              rules={[
                { required: true, message: "Telefon kiritish shart" },
                {
                  pattern: /^\+998[0-9]{9}$/,
                  message:
                    "Telefon raqami +998 bilan boshlanib, 9 ta raqam bo'lishi kerak",
                },
              ]}
            >
              <Input placeholder="+998901234567" />
            </Form.Item>
            {userType === "distributor" && (
              <Form.Item
                label="Parol"
                name={"password"}
                rules={[
                  { required: true, message: "Parolni kiritish shart" },
                  {
                    minLength: 4,
                    message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
                  },
                ]}
              >
                <Input type="password" placeholder="****" />
              </Form.Item>
            )}
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Saqlash
              </Button>
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );

  return (
    <div className="sale" style={{ height: "100%" }}>
      {isMobile ? renderMobileView() : renderDesktopView()}
    </div>
  );
};

export default Sale;
