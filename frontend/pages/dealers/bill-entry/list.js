import React, { useState, useEffect } from 'react';
import { Table, Input, Button, message, Space, Spin, Select, Modal, DatePicker, Typography, Card } from 'antd';
import { SearchOutlined, EditOutlined, ClearOutlined, PrinterOutlined, StockOutlined, FileDoneOutlined, DollarOutlined } from '@ant-design/icons'; // Added new icons
import { useRouter } from 'next/router';
import Link from 'next/link';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const BillEntryList = () => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [branches, setBranches] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchBills();
    fetchBranches();
    fetchDealers();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://apib.dinasuvadu.in/api/dealers/bills', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      const result = await response.json();
      if (response.ok) {
        console.log('Fetched bills from API:', result);
        setBills(result);
        setFilteredBills(result);
      } else {
        message.error(result.message || 'Failed to fetch bills');
      }
    } catch (err) {
      message.error('Server error while fetching bills');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch('https://apib.dinasuvadu.in/api/branches/public', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (response.ok) {
        setBranches(result);
      } else {
        message.error('Failed to fetch branches');
      }
    } catch (err) {
      message.error('Server error while fetching branches');
      console.error('Error:', err);
    }
  };

  const fetchDealers = async () => {
    try {
      const response = await fetch('https://apib.dinasuvadu.in/api/dealers', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (response.ok) {
        setDealers(result);
      } else {
        message.error('Failed to fetch dealers');
      }
    } catch (err) {
      message.error('Server error while fetching dealers');
      console.error('Error:', err);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    filterBills(value, selectedBranch, selectedDealer, selectedDateRange);
  };

  const handleBranchFilter = (branchId) => {
    setSelectedBranch(branchId);
    filterBills(searchText, branchId, selectedDealer, selectedDateRange);
  };

  const handleDealerFilter = (value) => {
    setSelectedDealer(value);
    filterBills(searchText, selectedBranch, value, selectedDateRange);
  };

  const handleDateFilter = (dates) => {
    setSelectedDateRange(dates);
    filterBills(searchText, selectedBranch, selectedDealer, dates);
  };

  const filterBills = (search, branchId, dealerId, dateRange) => {
    let filtered = [...bills];
    console.log('Applying filter with:', { search, branchId, dealerId, dateRange });

    // Apply search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (bill) =>
          bill.billNumber.toLowerCase().includes(lowerSearch) ||
          (bill.dealer?.dealer_name && bill.dealer.dealer_name.toLowerCase().includes(lowerSearch)) ||
          (bill.branch?.name && bill.branch.name.toLowerCase().includes(lowerSearch))
      );
    }

    // Apply branch filter
    if (branchId) {
      filtered = filtered.filter((bill) => bill.branch?._id === branchId);
    }

    // Apply dealer filter
    if (dealerId) {
      filtered = filtered.filter((bill) => bill.dealer?._id === dealerId);
    }

    // Apply date filter (created_at only)
    if (dateRange && dateRange.length === 2) {
      const startDate = dayjs(dateRange[0]).startOf('day');
      const endDate = dayjs(dateRange[1]).endOf('day');
      filtered = filtered.filter((bill) => {
        const billDate = dayjs(bill.created_at);
        return billDate.isValid() && billDate.isBetween(startDate, endDate, null, '[]');
      });
      console.log('Filtered by created_at:', filtered.map((b) => ({ id: b._id, created_at: b.created_at })));
    }

    setFilteredBills(filtered);
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedBranch(null);
    setSelectedDealer(null);
    setSelectedDateRange(null);
    setFilteredBills(bills);
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Bill Entry List</title>
          <style>
            @media print {
              @page { size: A4; margin: 20mm; }
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; }
              th, td { border: 1px solid #000; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Bill Entry List</h1>
          <table>
            <thead>
              <tr>
                <th>Serial No</th>
                <th>Bill Number</th>
                <th>Amount (₹)</th>
                <th>Dealer</th>
                <th>Branch</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredBills
                .map(
                  (bill, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${bill.billNumber}</td>
                      <td>₹${bill.amount.toFixed(2)}</td>
                      <td>${bill.dealer?.dealer_name || 'N/A'}</td>
                      <td>${bill.branch?.name || 'N/A'}</td>
                      <td>${dayjs(bill.created_at).local().format('YYYY-MM-DD HH:mm:ss')}</td>
                    </tr>
                  `
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const showModal = (imageUrl) => {
    setPreviewImage(imageUrl);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setPreviewImage('');
  };

  const columns = [
    {
      title: 'Serial No',
      key: 'serial_no',
      render: (_, __, index) => index + 1,
      width: 80,
    },
    {
      title: 'Bill Number',
      dataIndex: 'billNumber',
      key: 'billNumber',
    },
    {
      title: 'Amount (₹)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `₹${amount.toFixed(2)}`,
    },
    {
      title: 'Dealer',
      dataIndex: ['dealer', 'dealer_name'],
      key: 'dealer',
      render: (dealer_name) => dealer_name || 'N/A',
    },
    {
      title: 'Branch',
      dataIndex: ['branch', 'name'],
      key: 'branch',
      render: (name) => name || 'N/A',
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'date',
      render: (date) => {
        const parsedDate = dayjs.utc(date).local();
        return parsedDate.isValid() ? parsedDate.format('YYYY-MM-DD HH:mm:ss') : 'N/A';
      },
    },
    {
      title: 'Bill',
      key: 'billImage',
      render: (_, record) =>
        record.billImage ? (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              showModal(`https://apib.dinasuvadu.in/${record.billImage}`);
            }}
          >
            Bill
          </a>
        ) : (
          'No Image'
        ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Link href={`/dealers/bill-entry/edit/${record._id}`} passHref>
            <Button icon={<EditOutlined />} />
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: '40px 20px',
        background: 'linear-gradient(to bottom, #f0f2f5, #e6e9f0)', // Added gradient background
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ maxWidth: '1600px', width: '100%' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <Space>
            {/* Stock Add Icon Button */}
            <Button
              type="default"
              size="large"
              icon={<StockOutlined />}
              href="/dealers/stock-entry/create"
            />
            {/* Stock List Button */}
            <Button
              type="default"
              size="large"
              href="/dealers/stock-entry/list"
            >
              Stock List
            </Button>
            {/* Closing Entry Add Icon Button */}
            <Button
              type="default"
              size="large"
              icon={<FileDoneOutlined />}
              href="/dealers/closing-entry/closingentry"
            />
            {/* Closing Entry List Button */}
            <Button
              type="default"
              size="large"
              href="/dealers/closing-entry/list"
            >
              Closing Entry List
            </Button>
            {/* Expense Entry Button (Unchanged) */}
            <Button
              type="default"
              size="large"
              icon={<DollarOutlined />}
              href="/dealers/expense/ExpenseEntry"
            >
              Expense Entry
            </Button>
          </Space>

          <Title
            level={2}
            style={{
              margin: 0,
              color: '#1a3042',
              fontWeight: 'bold',
              flexGrow: 1,
              textAlign: 'center',
            }}
          >
            Bill Entry List
          </Title>

          <div style={{ width: '300px' }}></div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Card
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                background: '#fff',
                marginBottom: '20px',
              }}
            >
              <Space wrap style={{ width: '100%', padding: '10px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Text strong>Search</Text>
                  <Input
                    placeholder="Search by bill number, dealer, or branch"
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    prefix={<SearchOutlined />}
                    style={{ width: '300px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Text strong>Branch</Text>
                  <Select
                    placeholder="Filter by Branch"
                    style={{ width: '200px' }}
                    onChange={handleBranchFilter}
                    allowClear
                    value={selectedBranch}
                  >
                    {branches.map((branch) => (
                      <Option key={branch._id} value={branch._id}>
                        {branch.name}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Text strong>Dealer</Text>
                  <Select
                    placeholder="Filter by Dealer"
                    style={{ width: '200px' }}
                    onChange={handleDealerFilter}
                    allowClear
                    value={selectedDealer}
                  >
                    {dealers.map((dealer) => (
                      <Option key={dealer._id} value={dealer._id}>
                        {dealer.dealer_name}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Text strong>Date Range</Text>
                  <RangePicker
                    style={{ width: '250px' }}
                    onChange={handleDateFilter}
                    value={selectedDateRange}
                    format="YYYY-MM-DD"
                    placeholder={['Created Start', 'Created End']}
                  />
                </div>
                <Space style={{ marginTop: '20px' }}>
                  <Button
                    icon={<PrinterOutlined />}
                    onClick={handlePrint}
                  />
                  <Button
                    type="default"
                    icon={<ClearOutlined />}
                    onClick={clearFilters}
                  >
                    Reset
                  </Button>
                </Space>
              </Space>
            </Card>

            <Card
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                background: '#fff',
              }}
            >
              <Table
                columns={columns}
                dataSource={filteredBills}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                bordered
              />
            </Card>
          </>
        )}

        <Modal
          title="Bill Preview"
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button key="close" onClick={handleModalClose}>
              Close
            </Button>,
          ]}
          width={600}
        >
          {previewImage ? (
            <img
              src={previewImage}
              alt="Bill Preview"
              style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain' }}
              onError={(e) => {
                console.error('Image load error:', e);
                message.error('Failed to load bill image');
              }}
            />
          ) : (
            <p>No bill image available</p>
          )}
        </Modal>
      </div>
    </div>
  );
};

BillEntryList.useLayout = false;
export default BillEntryList;