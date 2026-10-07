'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface StatusChartProps {
  stats: {
    pending: number
    shipped: number
    completed: number
    cancelled: number
  }
}

const COLORS = {
  pending: '#f59e0b',
  shipped: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444',
}

export function StatusDistributionChart({ stats }: StatusChartProps) {
  const data = [
    { name: 'Perlu Dikirim', value: stats.pending, key: 'pending' },
    { name: 'Dikirim', value: stats.shipped, key: 'shipped' },
    { name: 'Selesai', value: stats.completed, key: 'completed' },
    { name: 'Dibatalkan', value: stats.cancelled, key: 'cancelled' },
  ].filter((item) => item.value > 0)

  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribusi Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-slate-400">
            Tidak ada data
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribusi Status Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                animationBegin={200}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.key as keyof typeof COLORS]}
                    strokeWidth={2}
                    stroke="#fff"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [
                  `${value} pesanan`,
                  'Jumlah',
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value, entry) => (
                  <span className="text-xs text-slate-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}
