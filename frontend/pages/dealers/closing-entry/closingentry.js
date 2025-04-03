import React, { useState, useEffect } from 'react';
import {
  Select,
  DatePicker,
  InputNumber,
  Button,
  message,
  Spin,
  Typography,
  Space,
  Card,
  Tooltip,
} from 'antd';
import { SaveOutlined, CreditCardOutlined, MobileOutlined, DollarOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const { Option } = Select;
const { Text, Title } = Typography;

const ClosingEntry = () => {
  const router = useRouter();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [branchId, setBranchId] = useState(null);
  const [date, setDate] = useState(dayjs());
  const [systemSales, setSystemSales] = useState(0);
  const [manualSales, setManualSales] = useState(0);
  const [onlineSales, setOnlineSales] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [creditCardPayment, setCreditCardPayment] = useState(0);
  const [upiPayment, setUpiPayment] = useState(0);
  const [cashPayment, setCashPayment] = useState(0);
  const [denom2000, setDenom2000] = useState(0);
  const [denom500, setDenom500] = useState(0);
  const [denom200, setDenom200] = useState(0);
  const [denom100, setDenom100] = useState(0);
  const [denom50, setDenom50] = useState(0);
  const [denom20, setDenom20] = useState(0);
  const [denom10, setDenom10] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [discrepancy, setDiscrepancy] = useState(0);

  // Fetch branches on page load
  useEffect(() => {
    fetchBranches();
  }, []);

  // Recalculate totals whenever inputs change
  useEffect(() => {
    const total = (systemSales || 0) + (manualSales || 0) + (onlineSales || 0);
    setTotalSales(total);

    const totalCashFromDenom =
      (denom2000 || 0) * 2000 +
      (denom500 || 0) * 500 +
      (denom200 || 0) * 200 +
      (denom100 || 0) * 100 +
      (denom50 || 0) * 50 +
      (denom20 || 0) * 20 +
      (denom10 || 0) * 10;
    setCashPayment(totalCashFromDenom);

    const totalPay = (creditCardPayment || 0) + (upiPayment || 0) + (totalCashFromDenom || 0) + (expenses || 0);
    setTotalPayments(totalPay);

    setDiscrepancy(totalPay - total);
  }, [
    systemSales,
    manualSales,
    onlineSales,
    expenses,
    creditCardPayment,
    upiPayment,
    denom2000,
    denom500,
    denom200,
    denom100,
    denom50,
    denom20,
    denom10,
  ]);

  const fetchBranches = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!branchId) {
      message.error('Please select a branch');
      return;
    }
    if (!date) {
      message.error('Please select a date');
      return;
    }
    if (systemSales === null || systemSales === undefined) {
      message.error('Please enter system sales');
      return;
    }
    if (manualSales === null || manualSales === undefined) {
      message.error('Please enter manual sales');
      return;
    }
    if (onlineSales === null || onlineSales === undefined) {
      message.error('Please enter online sales');
      return;
    }
    if (expenses === null || expenses === undefined) {
      message.error('Please enter expenses');
      return;
    }
    if (
      creditCardPayment === null ||
      creditCardPayment === undefined ||
      upiPayment === null ||
      upiPayment === undefined ||
      cashPayment === null ||
      cashPayment === undefined
    ) {
      message.error('Please enter all payment amounts');
      return;
    }
    if (
      denom2000 === null ||
      denom2000 === undefined ||
      denom500 === null ||
      denom500 === undefined ||
      denom200 === null ||
      denom200 === undefined ||
      denom100 === null ||
      denom100 === undefined ||
      denom50 === null ||
      denom50 === undefined ||
      denom20 === null ||
      denom20 === undefined ||
      denom10 === null ||
      denom10 === undefined
    ) {
      message.error('Please enter all denomination counts');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('https://apib.dinasuvadu.in/api/closing-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId,
          date: date.format('YYYY-MM-DD'),
          systemSales,
          manualSales,
          onlineSales,
          expenses,
          creditCardPayment,
          upiPayment,
          cashPayment,
          denom2000,
          denom500,
          denom200,
          denom100,
          denom50,
          denom20,
          denom10,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        message.success('Closing entry submitted successfully');
        // Reset form
        setBranchId(null);
        setDate(dayjs());
        setSystemSales(0);
        setManualSales(0);
        setOnlineSales(0);
        setExpenses(0);
        setCreditCardPayment(0);
        setUpiPayment(0);
        setCashPayment(0);
        setDenom2000(0);
        setDenom500(0);
        setDenom200(0);
        setDenom100(0);
        setDenom50(0);
        setDenom20(0);
        setDenom10(0);
      } else {
        message.error(result.message || 'Failed to submit closing entry');
      }
    } catch (err) {
      message.error('Server error while submitting closing entry');
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        padding: '40px 20px',
        background: 'linear-gradient(to bottom, #f0f2f5, #e6e9f0)',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ maxWidth: '1200px', width: '100%' }}>
        <Title
          level={2}
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            color: '#1a3042',
            fontWeight: 'bold',
          }}
        >
          Closing Entry
        </Title>

        <Space style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <Button
            type="default"
            icon={<UnorderedListOutlined />}
            onClick={() => router.push('/dealers/closing-entry/list')}
            style={{
              background: 'linear-gradient(to right, #34495e, #1a3042)',
              borderColor: '#34495e',
              color: '#fff',
            }}
          >
            View Closing Entries
          </Button>
        </Space>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '30px',
              alignItems: 'start',
              '@media (max-width: 768px)': {
                gridTemplateColumns: '1fr',
              },
            }}
          >
            {/* Form Section */}
            <Card
              title={<Title level={4} style={{ margin: 0, color: '#34495e' }}>Enter Closing Details</Title>}
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                background: '#fff',
                transition: 'all 0.3s ease',
              }}
              hoverable
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '150px 1fr',
                  gap: '15px',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <Text strong>Branch:</Text>
                <Select
                  placeholder="Select Branch"
                  value={branchId}
                  onChange={(value) => setBranchId(value)}
                  allowClear
                  style={{ width: '100%' }}
                  size="large"
                >
                  {branches.map((branch) => (
                    <Option key={branch._id} value={branch._id}>
                      {branch.name}
                    </Option>
                  ))}
                </Select>

                <Text strong>Date:</Text>
                <DatePicker
                  value={date}
                  onChange={(value) => setDate(value || dayjs())}
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  size="large"
                />

                <Text strong>System Sales (₹):</Text>
                <InputNumber
                  value={systemSales}
                  onChange={(value) => setSystemSales(value)}
                  min={0}
                  formatter={(value) => `₹${value}`}
                  parser={(value) => value.replace('₹', '')}
                  style={{ width: '100%' }}
                  size="large"
                />

                <Text strong>Manual Sales (₹):</Text>
                <InputNumber
                  value={manualSales}
                  onChange={(value) => setManualSales(value)}
                  min={0}
                  formatter={(value) => `₹${value}`}
                  parser={(value) => value.replace('₹', '')}
                  style={{ width: '100%' }}
                  size="large"
                />

                <Text strong>Online Sales (₹):</Text>
                <InputNumber
                  value={onlineSales}
                  onChange={(value) => setOnlineSales(value)}
                  min={0}
                  formatter={(value) => `₹${value}`}
                  parser={(value) => value.replace('₹', '')}
                  style={{ width: '100%' }}
                  size="large"
                />

                <Text strong>Expenses (₹):</Text>
                <InputNumber
                  value={expenses}
                  onChange={(value) => setExpenses(value)}
                  min={0}
                  formatter={(value) => `₹${value}`}
                  parser={(value) => value.replace('₹', '')}
                  style={{ width: '100%' }}
                  size="large"
                />

                <Text strong>
                  Credit Card (₹):
                  <Tooltip title="Amount paid via credit/debit card">
                    <CreditCardOutlined style={{ marginLeft: '8px', color: '#1890ff' }} />
                  </Tooltip>
                </Text>
                <InputNumber
                  value={creditCardPayment}
                  onChange={(value) => setCreditCardPayment(value)}
                  min={0}
                  formatter={(value) => `₹${value}`}
                  parser={(value) => value.replace('₹', '')}
                  style={{ width: '100%' }}
                  size="large"
                />

                <Text strong>
                  UPI (₹):
                  <Tooltip title="Amount paid via UPI (e.g., Google Pay, PhonePe)">
                    <MobileOutlined style={{ marginLeft: '8px', color: '#1890ff' }} />
                  </Tooltip>
                </Text>
                <InputNumber
                  value={upiPayment}
                  onChange={(value) => setUpiPayment(value)}
                  min={0}
                  formatter={(value) => `₹${value}`}
                  parser={(value) => value.replace('₹', '')}
                  style={{ width: '100%' }}
                  size="large"
                />

                <Text strong>
                  Cash Denominations:
                  <Tooltip title="Enter the count of each denomination">
                    <DollarOutlined style={{ marginLeft: '8px', color: '#1890ff' }} />
                  </Tooltip>
                </Text>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Text>2000 ×</Text>
                  <InputNumber
                    value={denom2000}
                    onChange={(value) => setDenom2000(value)}
                    min={0}
                    size="large"
                  />
                  <Text>500 ×</Text>
                  <InputNumber
                    value={denom500}
                    onChange={(value) => setDenom500(value)}
                    min={0}
                    size="large"
                  />
                  <Text>200 ×</Text>
                  <InputNumber
                    value={denom200}
                    onChange={(value) => setDenom200(value)} // Fixed typo: was setDenom2000
                    min={0}
                    size="large"
                  />
                  <Text>100 ×</Text>
                  <InputNumber
                    value={denom100}
                    onChange={(value) => setDenom100(value)}
                    min={0}
                    size="large"
                  />
                  <Text>50 ×</Text>
                  <InputNumber
                    value={denom50}
                    onChange={(value) => setDenom50(value)}
                    min={0}
                    size="large"
                  />
                  <Text>20 ×</Text>
                  <InputNumber
                    value={denom20}
                    onChange={(value) => setDenom20(value)}
                    min={0}
                    size="large"
                  />
                  <Text>10 ×</Text>
                  <InputNumber
                    value={denom10}
                    onChange={(value) => setDenom10(value)}
                    min={0}
                    size="large"
                  />
                </div>
              </div>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                loading={submitting}
                size="large"
                style={{
                  width: '150px',
                  background: 'linear-gradient(to right, #34495e, #1a3042)',
                  borderColor: '#34495e',
                  borderRadius: '8px',
                  display: 'block',
                  margin: '0 auto',
                  transition: 'all 0.3s ease',
                }}
              >
                Submit
              </Button>
            </Card>

            {/* Summary Section */}
            <Card
              title={<Title level={4} style={{ margin: 0, color: '#34495e' }}>Summary</Title>}
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                background: '#fff',
                transition: 'all 0.3s ease',
                position: 'sticky',
                top: '40px',
              }}
              hoverable
            >
              <Space direction="vertical" style={{ width: '100%', fontSize: '14px' }}>
                {/* Sales */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>System Sales:</Text>
                  <Text>₹{systemSales || 0}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Manual Sales:</Text>
                  <Text>₹{manualSales || 0}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Online Sales:</Text>
                  <Text>₹{onlineSales || 0}</Text>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderTop: '1px solid #e8e8e8',
                    fontWeight: 'bold',
                  }}
                >
                  <Text strong>Total Sales:</Text>
                  <Text strong>₹{totalSales}</Text>
                </div>

                {/* Payment Breakdown */}
                <div style={{ marginTop: '20px' }}>
                  <Title level={5} style={{ margin: 0, color: '#34495e' }}>
                    Payment Breakdown
                  </Title>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <Text>
                      <CreditCardOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                      Credit Card:
                    </Text>
                    <Text>₹{creditCardPayment || 0}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>
                      <MobileOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                      UPI:
                    </Text>
                    <Text>₹{upiPayment || 0}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>
                      <DollarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                      Cash:
                    </Text>
                    <Text>₹{cashPayment || 0}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Expenses:</Text>
                    <Text>₹{expenses || 0}</Text>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderTop: '1px solid #e8e8e8',
                      fontWeight: 'bold',
                    }}
                  >
                    <Text strong>Total Payments:</Text>
                    <Text strong>₹{totalPayments}</Text>
                  </div>
                </div>

                {/* Denomination Breakdown */}
                <div style={{ marginTop: '20px' }}>
                  <Title level={5} style={{ margin: 0, color: '#34495e' }}>
                    Cash Denomination Breakdown
                  </Title>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <Text>2000 × {denom2000}:</Text>
                    <Text>₹{(denom2000 || 0) * 2000}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>500 × {denom500}:</Text>
                    <Text>₹{(denom500 || 0) * 500}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>200 × {denom200}:</Text>
                    <Text>₹{(denom200 || 0) * 200}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>100 × {denom100}:</Text>
                    <Text>₹{(denom100 || 0) * 100}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>50 × {denom50}:</Text>
                    <Text>₹{(denom50 || 0) * 50}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>20 × {denom20}:</Text>
                    <Text>₹{(denom20 || 0) * 20}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>10 × {denom10}:</Text>
                    <Text>₹{(denom10 || 0) * 10}</Text>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderTop: '1px solid #e8e8e8',
                      fontWeight: 'bold',
                    }}
                  >
                    <Text strong>Total Cash Amount:</Text>
                    <Text strong>₹{cashPayment || 0}</Text>
                  </div>
                </div>

                {/* Discrepancy */}
                <div style={{ marginTop: '20px' }}>
                  <Title level={5} style={{ margin: 0, color: '#34495e' }}>
                    Discrepancy
                  </Title>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <Text>Total Sales:</Text>
                    <Text>₹{totalSales}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Total Payments:</Text>
                    <Text>₹{totalPayments}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <Text>Status:</Text>
                    {discrepancy === 0 ? (
                      <Text style={{ color: '#52c41a', fontSize: '14px' }}>
                        Everything OK
                      </Text>
                    ) : (
                      <Text style={{ color: '#ff4d4f', fontSize: '14px' }}>
                        Difference: ₹{discrepancy}
                      </Text>
                    )}
                  </div>
                </div>
              </Space>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

ClosingEntry.useLayout = false;
export default ClosingEntry;