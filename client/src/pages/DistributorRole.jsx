import React, { useState } from "react";
import {
  useDeliverSaleMutation,
  useGetSalesQuery,
  usePaymentSaleMutation,
} from "../context/service/sale.service";
import {
  Button,
  Card,
  Col,
  Row,
  Space,
  Form,
  message,
  Modal,
  Input,
  Table,
  List,
  Typography,
} from "antd";
import {
  FaBoxes,
  FaCheck,
  FaDollarSign,
  FaUser,
  FaPhone,
  FaMoneyBillAlt,
  FaBalanceScale,
} from "react-icons/fa";
import { MdOutlineReport } from "react-icons/md";
import "./globall.css";

const { Text } = Typography;

const DistributorRole = () => {
  const { data: sales = [], isLoading, refetch } = useGetSalesQuery();
  const [form] = Form.useForm();
  const [deliverSale] = useDeliverSaleMutation();
  const [paymentSale] = usePaymentSaleMutation();

  const [actionType, setActionType] = useState("");
  const [paymentModal, setPaymentModal] = useState(false);
  const [productsModal, setProductsModal] = useState(false);
  const [modalProducts, setModalProducts] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");

  const userId = localStorage.getItem("userId");
  const userSales = sales.filter((sale) => sale.distributorId._id === userId);

  const statusTypes = {
    inprogress: "Jarayonda",
    delivered: "Yetkazilgan",
  };

  const actionTypes = {
    payment: "To'lov qilish",
    deliver: "Yetkazishni belgilash",
  };

  const packageTypes = {
    piece: "Dona",
    box: "Quti",
  };

  async function handlePayment(values) {
    try {
      const data = {
        paymentAmount: Number(values.paymentAmount),
      };
      if (actionType === "deliver") {
        await deliverSale({ id: selectedItem, body: data }).unwrap();
      } else {
        await paymentSale({ id: selectedItem, body: data }).unwrap();
      }
      message.success(
        actionType === "deliver"
          ? "Yetkazilganlik muvaffaqiyatli belgilandi"
          : "To'lov muvaffaqiyatli amalga oshirildi"
      );
      form.resetFields();
      setSelectedItem("");
      setActionType("");
      setPaymentModal(false);
      refetch();
    } catch (error) {
      console.log(error);
      message.error("Xatolik yuz berdi");
    }
  }

  const renderModalProducts = () => {
    const isMobile = window.innerWidth <= 768;

    if (!isMobile) {
      return (
        <Table
          style={{ overflowX: "auto" }}
          dataSource={modalProducts}
          rowKey="_id"
          columns={[
            { title: "Tovar", dataIndex: "productName" },
            {
              title: "Qadoq turi",
              dataIndex: "productId",
              render: (text) => packageTypes[text.productTypeId.packageType],
            },
            { title: "Sotilgan miqdor", dataIndex: "quantity" },
            {
              title: "Sotilgan quti soni",
              render: (_, record) =>
                record.productId.productTypeId.packageType === "box"
                  ? record.quantity /
                    record.productId.productTypeId.pieceQuantityPerBox
                  : "-",
            },
            { title: "Sotilgan narx", dataIndex: "sellingPrice" },
            {
              title: "Jami to'lov",
              render: (_, record) =>
                (record.sellingPrice * record.quantity).toLocaleString(),
            },
          ]}
        />
      );
    }

    return (
      <List
        dataSource={modalProducts}
        renderItem={(item) => (
          <Card size="small" style={{ marginBottom: 10 }}>
            <Text strong>{item.productName}</Text>
            <p>
              Qadoq turi:{" "}
              {packageTypes[item.productId.productTypeId.packageType]}
            </p>
            <p>Sotilgan miqdor: {item.quantity}</p>
            <p>
              Sotilgan quti soni:{" "}
              {item.productId.productTypeId.packageType === "box"
                ? item.quantity /
                  item.productId.productTypeId.pieceQuantityPerBox
                : "-"}
            </p>
            <p>Sotilgan narx: {item.sellingPrice}</p>
            <p>
              <strong>
                Jami to'lov:{" "}
                {(item.sellingPrice * item.quantity).toLocaleString()}
              </strong>
            </p>
          </Card>
        )}
      />
    );
  };

  return (
    <div className="distributor-role">
      <Modal
        open={paymentModal}
        onCancel={() => {
          setPaymentModal(false);
          form.resetFields();
          setSelectedItem("");
          setActionType("");
        }}
        title={actionTypes[actionType]}
        footer={[]}
      >
        <Form form={form} onFinish={handlePayment} layout="vertical">
          <Form.Item
            name="paymentAmount"
            label="To'lov miqdori"
            rules={[{ required: true, message: "To'lov miqdorini kiriting" }]}
          >
            <Input type="number" placeholder="100000" />
          </Form.Item>
          <Button htmlType="submit" type="primary" block>
            Saqlash
          </Button>
        </Form>
      </Modal>

      <Modal
        open={productsModal}
        onCancel={() => {
          setProductsModal(false);
          setModalProducts([]);
        }}
        title="Mahsulotlar"
        footer={[]}
      >
        {renderModalProducts()}
      </Modal>

      <div className="sales-scroll">
        <Space direction="vertical" style={{ width: "100%" }}>
          {userSales.filter(
            (sale) => !(sale.isDebt === false && sale.status === "delivered")
          ).length < 1 ? (
            <p>Sotuvlar bo'sh</p>
          ) : (
            userSales
              .filter(
                (sale) =>
                  !(sale.isDebt === false && sale.status === "delivered")
              )
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((sale) => (
                <Card className="sale-card" key={sale._id}>
                  <Row gutter={[16, 8]}>
                    <Col span={12}>
                      <p>
                        <FaUser /> <strong>{sale.clientId.fullname}</strong>
                      </p>
                    </Col>
                    <Col span={12}>
                      <p>
                        <FaPhone /> <strong>{sale.clientId.phone}</strong>
                      </p>
                    </Col>
                    <Col span={12}>
                      <p>
                        <FaMoneyBillAlt />{" "}
                        <strong>
                          {sale.totalAmountToPaid.toLocaleString()}
                        </strong>
                      </p>
                    </Col>
                    <Col span={12}>
                      <p>
                        <FaBalanceScale />{" "}
                        <strong>
                          {(
                            sale.totalAmountToPaid - sale.totalAmountPaid
                          ).toLocaleString()}
                        </strong>
                      </p>
                    </Col>
                    <Col span={12}>
                      <p>
                        <MdOutlineReport />{" "}
                        <strong>{statusTypes[sale.status]}</strong>
                      </p>
                    </Col>
                    <Col
                      span={12}
                      style={{ display: "flex", justifyContent: "end" }}
                    >
                      <Space>
                        <Button
                          onClick={() => {
                            setSelectedItem(sale._id);
                            setPaymentModal(true);
                            setActionType("deliver");
                          }}
                          type="primary"
                          disabled={sale.status === "delivered"}
                        >
                          <FaCheck />
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedItem(sale._id);
                            setPaymentModal(true);
                            setActionType("payment");
                          }}
                          type="primary"
                          disabled={sale.status === "inprogress"}
                        >
                          <FaDollarSign />
                        </Button>
                        <Button
                          onClick={() => {
                            setProductsModal(true);
                            setModalProducts(sale.products);
                          }}
                          type="primary"
                        >
                          <FaBoxes />
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              ))
          )}
        </Space>
      </div>
    </div>
  );
};

export default DistributorRole;
