 import React, { useState, useEffect } from "react";
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
   Card,
   List,
   Typography,
   Modal,
   Drawer,
   Pagination,
 } from "antd";
 import {
   PhoneOutlined,
   EnvironmentOutlined,
   UserOutlined,
   PlusOutlined,
 } from "@ant-design/icons";

 const { Text, Title } = Typography;

 const Clients = () => {
   const { data: users, isLoading, refetch } = useGetUsersQuery();
   const [createUser] = useCreateUserMutation();
   const [updateUserLocation] = useUpdateUserLocationMutation();
   const [form] = Form.useForm();
   const [currentTab, setCurrentTab] = useState("1");
   const [isMobile, setIsMobile] = useState(false);
   const [locationLoading, setLocationLoading] = useState({});
   const [showAddDrawer, setShowAddDrawer] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);
   const pageSize = 5;

   useEffect(() => {
     const checkIsMobile = () => {
       setIsMobile(window.innerWidth <= 768);
     };

     checkIsMobile();
     window.addEventListener("resize", checkIsMobile);

     return () => window.removeEventListener("resize", checkIsMobile);
   }, []);

   const clients = users?.filter((user) => user.role === "client") || [];

   const saveLocation = async (clientId) => {
     if (!navigator.geolocation) {
       return message.error("Brauzeringiz joylashuvni qo'llab-quvvatlamaydi");
     }

     setLocationLoading((prev) => ({ ...prev, [clientId]: true }));

     const geoOptions = {
       enableHighAccuracy: true,
       timeout: 10000,
       maximumAge: 0,
     };

     navigator.geolocation.getCurrentPosition(
       async (position) => {
         const lat = position.coords.latitude;
         const lng = position.coords.longitude;
         const accuracy = position.coords.accuracy;

         try {
           await updateUserLocation({
             id: clientId,
             body: { lat, lng, accuracy },
           }).unwrap();

           message.success("Joylashuv muvaffaqiyatli saqlandi");
           refetch();
         } catch (error) {
           console.error(error);
           message.error("Joylashuvni saqlashda xatolik yuz berdi");
         } finally {
           setLocationLoading((prev) => ({ ...prev, [clientId]: false }));
         }
       },
       (error) => {
         let errorMessage = "Joylashuvni olishda xatolik";

         if (error.code === 1) {
           errorMessage =
             "Joylashuv uchun ruxsat berilmadi. Qurilma sozlamalaridan ruxsat bering";
         } else if (error.code === 2) {
           errorMessage = "Joylashuv aniqlanmadi";
         } else if (error.code === 3) {
           errorMessage = "Joylashuvni aniqlash vaqti tugadi";
         }

         message.error(errorMessage);
         setLocationLoading((prev) => ({ ...prev, [clientId]: false }));
       },
       geoOptions
     );
   };

   const previewCurrentLocation = () => {
     if (!navigator.geolocation) {
       return message.error("Brauzeringiz joylashuvni qo'llab-quvvatlamaydi");
     }

     message.loading({ content: "Joylashuv aniqlanmoqda...", key: "location" });

     navigator.geolocation.getCurrentPosition(
       (position) => {
         const lat = position.coords.latitude;
         const lng = position.coords.longitude;

         const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

         if (isMobile) {
           Modal.confirm({
             title: "Xaritani qanday ochmoqchisiz?",
             content: `Joylashuv: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
             okText: "Google Maps",
             cancelText: "Brauzerda ochish",
             onOk() {
               window.location.href = `geo:${lat},${lng}?q=${lat},${lng}`;
               setTimeout(() => (window.location.href = mapUrl), 500);
             },
             onCancel() {
               window.open(mapUrl, "_blank");
             },
           });
         } else {
           window.open(mapUrl, "_blank");
         }

         message.success({ content: "Joylashuv aniqlandi", key: "location" });
       },
       () => {
         message.error({
           content: "Joylashuvni olishda xatolik",
           key: "location",
         });
       }
     );
   };

   const openLocation = (lat, lng) => {
     const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

     if (isMobile) {
       Modal.confirm({
         title: "Xaritani qanday ochmoqchisiz?",
         content: `Tanlangan joy: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
         okText: "Google Maps",
         cancelText: "Brauzerda ochish",
         onOk() {
           window.location.href = `geo:${lat},${lng}?q=${lat},${lng}`;
           setTimeout(() => (window.location.href = mapUrl), 500);
         },
         onCancel() {
           window.open(mapUrl, "_blank");
         },
       });
     } else {
       window.open(mapUrl, "_blank");
     }
   };

   const columns = [
     {
       title: "To'liq ismi",
       dataIndex: "fullname",
       ellipsis: true,
     },
     {
       title: "Telefon raqami",
       dataIndex: "phone",
       ellipsis: true,
     },
     {
       title: "Lokatsiya",
       render: (_, record) => (
         <Space>
           <Button
             type="primary"
             onClick={() => saveLocation(record._id)}
             loading={locationLoading[record._id]}
             size={isMobile ? "small" : "middle"}
             icon={<EnvironmentOutlined />}
           >
             {isMobile ? "" : "Saqlash"}
           </Button>
           {record.location?.lat && record.location?.lng && (
             <Button
               type="link"
               onClick={() =>
                 openLocation(record.location.lat, record.location.lng)
               }
               size={isMobile ? "small" : "middle"}
             >
               Ko'rish
             </Button>
           )}
         </Space>
       ),
     },
   ];

   const onFinish = async (values) => {
     try {
       await createUser({
         fullname: values.fullname,
         phone: values.phone,
         role: "client",
       }).unwrap();

       message.success("Xaridor muvaffaqiyatli qo'shildi");
       form.resetFields();
       setCurrentTab("1");
       setShowAddDrawer(false);
       refetch();
     } catch (error) {
       message.error("Xaridor qo'shishda xatolik: " + error?.data?.message);
     }
   };

   const renderClientsList = () => {
     const paginatedClients = clients.slice(
       (currentPage - 1) * pageSize,
       currentPage * pageSize
     );

     if (!isMobile) {
       return (
         <Table
           scroll={{ x: "max-content" }}
           size="small"
           dataSource={clients}
           loading={isLoading}
           columns={columns}
           rowKey="_id"
           pagination={{
             size: "small",
             pageSize: 10,
             hideOnSinglePage: true,
           }}
         />
       );
     }

     return (
       <>
         <List
           loading={isLoading}
           dataSource={paginatedClients}
           renderItem={(client) => (
             <Card
               style={{ marginBottom: 10 }}
               size="small"
               actions={[
                 <Button
                   type="primary"
                   onClick={() => saveLocation(client._id)}
                   loading={locationLoading[client._id]}
                   icon={<EnvironmentOutlined />}
                   block
                 >
                   Joylashuv
                 </Button>,
                 client.location?.lat && client.location?.lng ? (
                   <Button
                     type="default"
                     onClick={() =>
                       openLocation(client.location.lat, client.location.lng)
                     }
                     block
                     icon={<EnvironmentOutlined />}
                   >
                     Xaritada ko'rish
                   </Button>
                 ) : (
                   <Button disabled block>
                     Joylashuv yo'q
                   </Button>
                 ),
               ]}
             >
               <List.Item.Meta
                 title={<Text strong>{client.fullname}</Text>}
                 description={
                   <Space direction="vertical" size={0}>
                     <Space>
                       <PhoneOutlined />
                       <a href={`tel:${client.phone}`}>{client.phone}</a>
                     </Space>
                   </Space>
                 }
               />
             </Card>
           )}
         />
         <div style={{ textAlign: "center", marginTop: 16 }}>
           <Pagination
             current={currentPage}
             pageSize={pageSize}
             total={clients.length}
             onChange={(page) => setCurrentPage(page)}
             size="small"
           />
         </div>
       </>
     );
   };

   const renderClientForm = () => {
     const formContent = (
       <Form
         autoComplete="off"
         layout="vertical"
         onFinish={onFinish}
         form={form}
       >
         <Form.Item
           label="To'liq ism"
           name="fullname"
           rules={[{ required: true, message: "To'liq ismni kiritish shart" }]}
         >
           <Input prefix={<UserOutlined />} placeholder="Ali Valiyev" />
         </Form.Item>
         <Form.Item
           label="Telefon"
           name="phone"
           rules={[
             { required: true, message: "Telefon kiritish shart" },
             {
               pattern: /^\+998[0-9]{9}$/,
               message:
                 "Telefon raqami +998 bilan boshlanib, 9 ta raqam bo'lishi kerak",
             },
           ]}
         >
           <Input prefix={<PhoneOutlined />} placeholder="+998901234567" />
         </Form.Item>
         <Form.Item>
           <Button type="primary" htmlType="submit" block>
             Saqlash
           </Button>
         </Form.Item>
       </Form>
     );

     if (isMobile) {
       return (
         <>
           <Button
             type="primary"
             icon={<PlusOutlined />}
             onClick={() => setShowAddDrawer(true)}
             style={{ marginBottom: 16 }}
             block
           >
             Yangi xaridor qo'shish
           </Button>

           <Drawer
             title="Yangi xaridor qo'shish"
             open={showAddDrawer}
             onClose={() => setShowAddDrawer(false)}
             placement="bottom"
             height="auto"
             bodyStyle={{ paddingBottom: 80 }}
           >
             {formContent}
           </Drawer>
         </>
       );
     } else {
       return formContent;
     }
   };

   return (
     <div className="clients-container" style={{ padding: isMobile ? 8 : 16 }}>
       {isMobile ? (
         <>
           <div style={{ marginBottom: 16 }}>
             <Title level={4}>Xaridorlar</Title>
             <Button
               onClick={previewCurrentLocation}
               type="primary"
               icon={<EnvironmentOutlined />}
               block
             >
               Mening joylashuvimni ko'rish
             </Button>
           </div>

           {renderClientForm()}

           <div style={{ marginTop: 16 }}>{renderClientsList()}</div>
         </>
       ) : (
         <Tabs
           activeKey={currentTab}
           onChange={(key) => {
             setCurrentTab(key);
             form.resetFields();
           }}
         >
           <Tabs.TabPane tab="Xaridorlar" key="1">
             <div style={{ marginBottom: 16 }}>
               <Button
                 onClick={previewCurrentLocation}
                 type="primary"
                 icon={<EnvironmentOutlined />}
               >
                 Mening hozirgi joylashuvimni ko'rish
               </Button>
             </div>
             {renderClientsList()}
           </Tabs.TabPane>

           <Tabs.TabPane tab="Xaridor qo'shish" key="2">
             {renderClientForm()}
           </Tabs.TabPane>
         </Tabs>
       )}
     </div>
   );
 };

 export default Clients;
