'use client';

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Typography, Space, Alert } from 'antd';
import { 
  UserOutlined, 
  HomeOutlined, 
  EnvironmentOutlined,
  TeamOutlined,
  PieChartOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import dynamic from 'next/dynamic';
import api from '@/lib/api';

const { Title, Text } = Typography;

const Pie = dynamic(() => import('@ant-design/plots').then((mod) => mod.Pie), {
  ssr: false,
  loading: () => <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin /></div>
});

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    overview: { totalResidents: 0, totalFamilies: 0, totalRw: 0, totalRt: 0 },
    demographics: { gender: [], religion: [], age: [] },
    rwDistribution: []
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/stats/dashboard');
      if (response.data && response.data.data) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Gagal memuat data statistik dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { overview, demographics, rwDistribution } = data;

  const rwPieConfig = {
    appendPadding: 10,
    data: rwDistribution.filter(d => d.count > 0),
    angleField: 'count',
    colorField: 'rw',
    radius: 0.8,
    label: { text: 'count', position: 'outside' },
    interactions: [{ type: 'element-active' }],
    legend: { position: 'bottom' },
    tooltip: { title: 'rw', items: [{ channel: 'y', valueFormatter: (d) => `${d} Jiwa` }] },
  };

  const genderPieConfig = {
    appendPadding: 10,
    data: demographics.gender,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.5,
    color: ['#1677ff', '#eb2f96'],
    label: { 
      text: (d) => {
        const total = demographics.gender.reduce((sum, item) => sum + item.value, 0);
        const percent = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
        return `${percent}%`;
      },
      position: 'inside',
      style: { fill: '#fff', fontSize: 14, fontWeight: 'bold' } 
    },
    interactions: [{ type: 'element-active' }],
    legend: { position: 'bottom' },
    tooltip: { title: 'type', items: [{ channel: 'y', valueFormatter: (d) => `${d} Jiwa` }] },
  };

  const religionPieConfig = {
    appendPadding: 10,
    data: demographics.religion,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.5,
    scale: {
      color: { palette: ['#52c41a', '#1890ff', '#f5222d', '#faad14', '#722ed1', '#eb2f96'] }
    },
    label: { 
      text: (d) => {
        const total = demographics.religion.reduce((sum, item) => sum + item.value, 0);
        const percent = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
        return `${percent}%`;
      },
      position: 'inside',
      style: { fill: '#fff', fontSize: 13, fontWeight: 'bold' } 
    },
    interactions: [{ type: 'element-active' }],
    legend: { position: 'bottom' },
    tooltip: { title: 'type', items: [{ channel: 'y', valueFormatter: (d) => `${d} Jiwa` }] },
  };

  const agePieConfig = {
    appendPadding: 10,
    data: demographics.age,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.64,
    scale: {
      color: { 
        domain: ['Balita (0-5)', 'Anak-anak (6-12)', 'Remaja (13-17)', 'Dewasa (18-59)', 'Lansia (60+)'],
        range: ['#36cfc9', '#52c41a', '#faad14', '#1890ff', '#722ed1']
      }
    },
    label: { 
      text: (d) => {
        const total = demographics.age.reduce((sum, item) => sum + item.value, 0);
        const percent = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
        return `${percent}%`;
      },
      position: 'outside',
      style: { fill: '#595959', fontSize: 13, fontWeight: 'bold' } 
    },
    interactions: [{ type: 'element-active' }],
    legend: { position: 'bottom' },
    tooltip: { title: 'type', items: [{ channel: 'y', valueFormatter: (d) => `${d} Jiwa` }] },
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
        <Title level={3}>Beranda</Title>
        <Text type="secondary">Ringkasan statistik kependudukan dan demografi warga.</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Overview Cards */}
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '4px solid #1677ff' }}>
            <Statistic title="Total Warga" value={overview.totalResidents} prefix={<UserOutlined style={{ color: '#1677ff' }} />} suffix="Jiwa" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '4px solid #52c41a' }}>
            <Statistic title="Total Keluarga" value={overview.totalFamilies} prefix={<HomeOutlined style={{ color: '#52c41a' }} />} suffix="KK" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '4px solid #faad14' }}>
            <Statistic title="Total RW" value={overview.totalRw} prefix={<EnvironmentOutlined style={{ color: '#faad14' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '4px solid #eb2f96' }}>
            <Statistic title="Total RT" value={overview.totalRt} prefix={<TeamOutlined style={{ color: '#eb2f96' }} />} />
          </Card>
        </Col>

        {/* Demographics Row 1 */}
        <Col xs={24} lg={12}>
            <Card title={<Space><PieChartOutlined /><span>Komposisi Jenis Kelamin</span></Space>} variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
              {loading ? <div style={{ height: 300 }}><Spin /></div> : (
                demographics.gender.some(d => d.value > 0) ? <Pie {...genderPieConfig} style={{ height: 300 }} /> : <EmptyDataMessage />
              )}
            </Card>
        </Col>

        <Col xs={24} lg={12}>
            <Card title={<Space><PieChartOutlined /><span>Demografi Rentang Usia</span></Space>} variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
              {loading ? <div style={{ height: 300 }}><Spin /></div> : (
                demographics.age.some(d => d.value > 0) ? <Pie {...agePieConfig} style={{ height: 300 }} /> : <EmptyDataMessage />
              )}
            </Card>
        </Col>

        {/* Demographics Row 2 */}
        <Col xs={24} lg={12}>
            <Card title={<Space><PieChartOutlined /><span>Distribusi Agama</span></Space>} variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
               {loading ? <div style={{ height: 300 }}><Spin /></div> : (
                demographics.religion.some(d => d.value > 0) ? <Pie {...religionPieConfig} style={{ height: 300 }} /> : <EmptyDataMessage />
              )}
            </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={<Space><TeamOutlined /><span>Sebaran Warga per RW</span></Space>} variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
            {loading ? <div style={{ height: 300 }}><Spin /></div> : (
              rwDistribution.some(d => d.count > 0) ? <Pie {...rwPieConfig} style={{ height: 300 }} /> : <EmptyDataMessage />
            )}
          </Card>
        </Col>

      </Row>
    </div>
  );
}
