'use client';

import React from 'react';
import { Table } from 'antd';

/**
 * DataTable is a reusable wrapper for Ant Design's Table component.
 * It provides consistent pagination and styling out-of-the-box.
 */
const DataTable = ({ 
  columns, 
  dataSource, 
  loading, 
  rowKey = 'id',
  ...props 
}) => {
  return (
    <div className="data-table-container">
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey={rowKey}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} data`,
        }}
        bordered
        style={{ borderRadius: '8px', overflow: 'hidden' }}
        {...props}
      />
    </div>
  );
};

export default DataTable;
