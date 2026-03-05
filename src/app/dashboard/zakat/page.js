'use client';

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Typography, Space, Alert } from 'antd';
import { 
  WalletOutlined, 
  GiftOutlined, 
  TeamOutlined, 
  UserOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import dynamic from 'next/dynamic';
import api from '@/lib/api';

const { Title, Text } = Typography;

const Pie = dynamic(() => import('@ant-design/plots').then((mod) => mod.Pie), {
  ssr: false,
  loading: () => <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>
});

const Bar = dynamic(() => import('@ant-design/plots').then((mod) => mod.Bar), {
  ssr: false,
  loading: () => <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>
});

export default function ZakatDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    overview: { totalRecipients: 0, totalCollections: 0, totalUang: 0, totalBeras: 0 },
    charts: { collectionComposition: [], recipientDistribution: [] }
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/zakat/stats');
      if (response.data && response.data.data) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch zakat dashboard stats:', err);
      setError('Gagal memuat data statistik zakat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { overview, charts } = data;

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  const formatBeras = (angka) => {
    return `${Number(angka || 0).toLocaleString('id-ID')} Liter/Kg`;
  };

  const compositionPieConfig = {
    appendPadding: 10,
    data: charts.collectionComposition,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.64,
    color: ['#1677ff', '#52c41a'],
    label: { 
      text: (d) => {
        const total = charts.collectionComposition.reduce((sum, item) => sum + item.value, 0);
        const percent = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
        return `${percent}%`;
      },
      position: 'outside',
      style: { fill: '#595959', fontSize: 13, fontWeight: 'bold' } 
    },
    interactions: [{ type: 'element-active' }],
    legend: { position: 'bottom' },
    tooltip: { title: 'type', items: [{ channel: 'y', valueFormatter: (d) => `${d} Muzakki` }] },
  };

  const distributionBarConfig = {
    data: charts.recipientDistribution,
    xField: 'value',
    yField: 'type',
    seriesField: 'type',
    color: ['#1890ff', '#36cfc9', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96', '#fa541c'],
    legend: { position: 'bottom' },
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
      text: (d) => `${d.value} Orang`,
    },
    tooltip: { title: 'type', items: [{ channel: 'x', valueFormatter: (d) => `${d} Orang` }] },
  };


  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon style={{ margin: 24 }} />;
  }

  const EmptyDataMessage = () => (
    <div style={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Text type="secondary">Belum ada data tersedia.</Text>
    </div>
  );

  return (
    <div style={{ padding: '8px 16px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3}>Dashboard Zakat</Title>
        <Text type="secondary">Ringkasan statistik penerimaan dan penyaluran zakat kepada mustahik.</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Overview Cards */}
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '4px solid #1677ff' }}>
            <Statistic 
              title="Total Uang Terkumpul" 
              value={overview.totalUang} 
              formatter={(val) => formatRupiah(val)}
              prefix={<WalletOutlined style={{ color: '#1677ff' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '4px solid #52c41a' }}>
            <Statistic 
              title="Total Beras Terkumpul" 
              value={overview.totalBeras} 
              formatter={(val) => formatBeras(val)}
              prefix={<GiftOutlined style={{ color: '#52c41a' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '4px solid #faad14' }}>
            <Statistic 
              title="Total Muzakki" 
              value={overview.totalCollections} 
              prefix={<TeamOutlined style={{ color: '#faad14' }} />} 
              suffix="Jiwa" 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '4px solid #eb2f96' }}>
            <Statistic 
              title="Total Mustahik" 
              value={overview.totalRecipients} 
              prefix={<UserOutlined style={{ color: '#eb2f96' }} />} 
              suffix="Orang" 
            />
          </Card>
        </Col>

        {/* Charts */}
        <Col xs={24} lg={10}>
          <Card title={<Space><PieChartOutlined /><span>Komposisi Muzakki (Uang vs Beras)</span></Space>} variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
            {loading ? <div style={{ height: 300 }}><Spin /></div> : (
              charts.collectionComposition.some(d => d.value > 0) ? <Pie {...compositionPieConfig} style={{ height: 300 }} /> : <EmptyDataMessage />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card title={<Space><TeamOutlined /><span>Distribusi Asnaf Mustahik</span></Space>} variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
            {loading ? <div style={{ height: 300 }}><Spin /></div> : (
              charts.recipientDistribution.some(d => d.value > 0) ? <Bar {...distributionBarConfig} style={{ height: 300 }} /> : <EmptyDataMessage />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
