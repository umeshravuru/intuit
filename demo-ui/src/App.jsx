import { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser, useAuth } from "@clerk/clerk-react";

import { Routes, Route, useNavigate } from 'react-router-dom'
import DeepDive from './DeepDive'

function Dashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeGrain, setTimeGrain] = useState('MONTH')
  const [periods, setPeriods] = useState(6)
  const navigate = useNavigate()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken();
      const response = await axios.get(`http://localhost:8080/api/forecast`, {
        params: {
          timeGrain: timeGrain,
          periods: periods
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data && response.data.length > 0) {
        // Group by date
        const groupedData = {}
        const stockCodes = new Set()

        response.data.forEach(item => {
          const date = item.forecastMonth
          if (!groupedData[date]) {
            groupedData[date] = { date }
          }
          groupedData[date][item.stockCode] = item.monthlyPredictedSales
          stockCodes.add(item.stockCode)
        })

        // unique categories
        const chartData = Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date))
        setData({ chartData, stockCodes: Array.from(stockCodes) })
      } else {
        setData({ chartData: [], stockCodes: [] })
      }
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [timeGrain, periods, user])

  // Generate random colors or a fixed palette for lines
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F'];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Sales Forecast</span>{' '}
                <span className="block text-indigo-600 xl:inline">Dashboard</span>
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Welcome back, {user?.firstName}!
              </p>
            </div>
            <div>
              <UserButton />
            </div>
          </header>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-6 items-end">
              <div>
                <label htmlFor="timeGrain" className="block text-sm font-medium text-gray-700 mb-2">Time Grain</label>
                <select
                  id="timeGrain"
                  value={timeGrain}
                  onChange={(e) => setTimeGrain(e.target.value)}
                  className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm border"
                >
                  <option value="WEEK">Week</option>
                  <option value="MONTH">Month</option>
                  <option value="YEAR">Year</option>
                </select>
              </div>

              <div>
                <label htmlFor="periods" className="block text-sm font-medium text-gray-700 mb-2">Forecast Periods</label>
                <input
                  type="number"
                  id="periods"
                  min="1"
                  max="100"
                  value={periods}
                  onChange={(e) => setPeriods(parseInt(e.target.value) || 1)}
                  className="block w-24 pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm border"
                />
              </div>

              <button
                onClick={fetchData}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Refresh Data
              </button>
            </div>

            <div className="p-6 min-h-[500px] flex items-center justify-center">
              {loading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  <p className="mt-4 text-gray-500">Running ML Forecast...</p>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center">
                  <p className="text-lg font-semibold">Error loading forecast</p>
                  <p>{error}</p>
                </div>
              ) : (
                <div className="w-full h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        stroke="#888888"
                        tick={{ fill: '#666' }}
                      />
                      <YAxis
                        stroke="#888888"
                        tick={{ fill: '#666' }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        formatter={(value, name) => [`$${parseFloat(value).toFixed(2)}`, `Category: ${name}`]}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      {data.stockCodes.map((code, index) => (
                        <Line
                          key={code}
                          type="monotone"
                          dataKey={code}
                          stroke={colors[index % colors.length]}
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={() => navigate('/deepDive')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Deep Dive Analysis
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl mb-8">
            <span className="block xl:inline">Sales Forecast</span>{' '}
            <span className="block text-indigo-600 xl:inline">Dashboard</span>
          </h1>
          <p className="text-xl text-gray-500 mb-8">Please sign in to view the forecast.</p>
          <div className="p-4 bg-indigo-600 rounded-lg text-white font-semibold hover:bg-indigo-700 transition cursor-pointer">
            <SignInButton />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/deepDive" element={<DeepDive />} />
        </Routes>
      </SignedIn>
    </div>
  )
}

export default App
