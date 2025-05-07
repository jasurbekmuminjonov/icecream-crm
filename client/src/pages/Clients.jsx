import React, { useState } from "react";
import {
  useCreateUserMutation,
  useGetUsersQuery,
  useUpdateUserLocationMutation,
} from "../context/service/user.service";
import {
  Tabs,
  Table,
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  Space,
} from "antd";

const Clients = () => {
  const { data: users, isLoading, refetch } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUserLocation] = useUpdateUserLocationMutation(); // ✅ yangi hook
  const [form] = Form.useForm();
  const [currentTab, setCurrentTab] = useState("1");

  const clients = users?.filter((user) => user.role === "client") || [];

  const saveLocation = async (clientId) => {
    if (!navigator.geolocation) {
      message.error("Brauzeringiz joylashuvni qo‘llab-quvvatlamaydi");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          await updateUserLocation({
            id: clientId,
            body: { lat, lng },
          }).unwrap();

          message.success("Joylashuv muvaffaqiyatli saqlandi");
          refetch();
        } catch (error) {
          console.error(error);
          message.error("Joylashuvni saqlashda xatolik yuz berdi");
        }
      },
      (error) => {
        console.error(error);
        message.error("Joylashuvni olishda xatolik");
      }
    );
  };

  const previewCurrentLocation = () => {
    if (!navigator.geolocation) {
      return message.error("Brauzeringiz joylashuvni qo‘llab-quvvatlamaydi");
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
          "_blank"
        );
      },
      (error) => {
        console.error(error);
        message.error("Joylashuvni olishda xatolik");
      }
    );
  };

  const columns = [
    { title: "To'liq ismi", dataIndex: "fullname" },
    { title: "Telefon raqami", dataIndex: "phone" },
    {
      title: "Lokatsiya",
      render: (_, record) => (
        <Space>
          <Button type="dashed" onClick={() => saveLocation(record._id)}>
            Joylashuvni saqlash
          </Button>
          {record.location?.lat && record.location?.lng && (
            <Button
              type="link"
              href={`https://www.google.com/maps/search/?api=1&query=${record.location.lat},${record.location.lng}`}
              target="_blank"
            >
              Ko‘rish
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const onFinish = async (values) => {
    try {
      let data = {
        fullname: values.fullname,
        phone: values.phone,
        role: "client",
      };
      await createUser(data).unwrap();
      message.success("Xaridor muvaffaqiyatli qo'shildi");
      form.resetFields();
      setCurrentTab("1");
    } catch (error) {
      message.error("Xaridor qo'shishda xatolik: " + error?.data?.message);
    }
  };

  return (
    <div className="distributors">
      <Tabs
        activeKey={currentTab}
        onChange={(key) => {
          setCurrentTab(key);
          form.resetFields();
        }}
      >
        <Tabs.TabPane tab="Xaridorlar" key="1">
          <div style={{ marginBottom: 10 }}>
            <Button onClick={previewCurrentLocation} type="primary">
              Mening hozirgi joylashuvimni ko‘rish
            </Button>
          </div>
          <Table
            style={{ overflowX: "auto" }}
            size="small"
            dataSource={clients}
            loading={isLoading}
            columns={columns}
            rowKey="_id"
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Xaridor qo'shish" key="2">
          <Form
            autoComplete="off"
            layout="vertical"
            onFinish={onFinish}
            form={form}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="To'liq ism"
                  name={"fullname"}
                  rules={[
                    { required: true, message: "To'liq ismni kiritish shart" },
                  ]}
                >
                  <Input placeholder="Ali Valiyev" />
                </Form.Item>
              </Col>
              <Col span={12}>
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
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Saqlash
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default Clients;
