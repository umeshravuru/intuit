
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth, UserButton } from "@clerk/clerk-react"
import { useNavigate } from 'react-router-dom'

export default function DeepDive() {
    const { getToken } = useAuth()
    const navigate = useNavigate()
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Filters
    const [filters, setFilters] = useState({
        category: '',
        currentMonth: '',
        explanation: ''
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getToken()
                const response = await axios.get('http://localhost:8080/api/deepDive', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                setData(response.data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleFilterChange = (e, field) => {
        setFilters(prev => ({
            ...prev,
            [field]: e.target.value
        }))
    }

    const filteredData = data.filter(item => {
        return (
            item.category.toLowerCase().includes(filters.category.toLowerCase()) &&
            item.currentMonth.toLowerCase().includes(filters.currentMonth.toLowerCase()) &&
            item.explanation.toLowerCase().includes(filters.explanation.toLowerCase())
        )
    })

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <button
                            onClick={() => navigate('/')}
                            className="text-indigo-600 hover:text-indigo-800 font-medium mb-2 flex items-center"
                        >
                            ← Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                            Deep Dive Analysis
                        </h1>
                    </div>
                    <div>
                        <UserButton />
                    </div>
                </header>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-500">
                            Error: {error}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/5">
                                            <div className="flex flex-col gap-2">
                                                <span>Category</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filter..."
                                                    className="block w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                                                    value={filters.category}
                                                    onChange={(e) => handleFilterChange(e, 'category')}
                                                />
                                            </div>
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/6">
                                            <div className="flex flex-col gap-2">
                                                <span>Month</span>
                                                <input
                                                    type="text"
                                                    placeholder="YYYY-MM-DD"
                                                    className="block w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                                                    value={filters.currentMonth}
                                                    onChange={(e) => handleFilterChange(e, 'currentMonth')}
                                                />
                                            </div>
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/6">
                                            Rev Change
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <div className="flex flex-col gap-2">
                                                <span>Explanation</span>
                                                <input
                                                    type="text"
                                                    placeholder="Search explanations..."
                                                    className="block w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                                                    value={filters.explanation}
                                                    onChange={(e) => handleFilterChange(e, 'explanation')}
                                                />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-indigo-50/30 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {row.category}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {row.currentMonth}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.revenueChangePct > 0
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {row.revenueChangePct > 0 ? '+' : ''}{row.revenueChangePct}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 leading-relaxed">
                                                {row.explanation}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredData.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500 italic">No results found matching your filters</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
