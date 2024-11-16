import { useState } from 'react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    career: '',
    interests: [],
    personalityTraits: [],
    relationshipGoals: []
  })
  const [generatedBio, setGeneratedBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [showBio, setShowBio] = useState(false)
  const [error, setError] = useState(null)

  const careerOptions = [
    'Software Engineer',
    'Entrepreneur', 
    'Artist',
    'Designer',
    'Teacher',
    'Doctor',
    'Marketing Professional',
    'Data Scientist',
    'Chef',
    'Musician'
  ]

  const interestOptions = [
    'Cooking',
    'Travel', 
    'Sports',
    'Music',
    'Reading',
    'Gaming',
    'Fitness',
    'Photography',
    'Art',
    'Technology',
    'Literature'
  ]

  const personalityOptions = [
    'Adventurous',
    'Creative',
    'Compassionate', 
    'Motivated',
    'Optimistic',
    'Empathetic',
    'Analytical',
    'Outgoing',
    'Introverted'
  ]

  const relationshipGoalOptions = [
    'Casual',
    'Long-term',
    'Adventurous',
    'Seeking Deep Connection',
    'Friendship First',
    'Marriage Minded'
  ]

  const handleCareerChange = (e) => {
    setFormData({...formData, career: e.target.value})
  }

  const handleCheckboxChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
  
    try {
      // Check if server is running with timeout and error handling
      const healthCheck = await Promise.race([
        fetch('http://localhost:8000/api/health/', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Server connection timed out')), 5000)
        )
      ])

      if (!healthCheck.ok) {
        throw new Error('Server is not running. Please start the server first.')
      }
  
      // Send form data to backend for bio generation with timeout and error handling
      const response = await Promise.race([
        fetch('http://localhost:8000/api/generate-bio/', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Bio generation request timed out')), 200000)
        )
      ])
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
  
      const data = await response.json()
      setGeneratedBio(data.bio)
      setShowBio(true)
    } catch (error) {
      console.error('Error generating bio:', error)
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        setError('Unable to connect to server. Please ensure the Django server is running at http://localhost:8000')
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.')
      }
      setShowBio(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8 rounded-3xl">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">
            Dinner Tonight
          </h1>
          <p className="text-xl text-white opacity-90">
            Generate a unique bio that captures your essence
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Form Section */}
          <div className={`transition-opacity duration-500 ease-in-out ${showBio ? 'hidden' : 'block'}`}>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="transition-all duration-300 ease-in-out transform hover:scale-102">
                  <label className="block text-lg font-medium text-gray-200 mb-3">
                    What&apos;s Your Career?
                  </label>
                  <select
                    value={formData.career}
                    onChange={handleCareerChange}
                    className="w-full p-3 border-2 border-gray-600 rounded-lg focus:border-purple-500 transition-all bg-gray-700 text-white"
                    required
                  >
                    <option value="">Choose your profession</option>
                    {careerOptions.map(career => (
                      <option key={career} value={career}>{career}</option>
                    ))}
                  </select>
                </div>

                <div className="transition-all duration-300 ease-in-out">
                  <label className="block text-lg font-medium text-gray-200 mb-3">
                    What Are Your Interests? (Select Multiple)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {interestOptions.map(interest => (
                      <label 
                        key={interest} 
                        className="flex items-center space-x-3 p-3 border-2 border-gray-600 rounded-lg hover:border-purple-500 hover:bg-gray-700 transition-all cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.interests.includes(interest)}
                          onChange={() => handleCheckboxChange('interests', interest)}
                          className="w-5 h-5 rounded text-purple-600"
                        />
                        <span className="text-gray-200">{interest}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="transition-all duration-300 ease-in-out">
                  <label className="block text-lg font-medium text-gray-200 mb-3">
                    What Are Your Personality Traits? (Select Multiple)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {personalityOptions.map(trait => (
                      <label 
                        key={trait} 
                        className="flex items-center space-x-3 p-3 border-2 border-gray-600 rounded-lg hover:border-purple-500 hover:bg-gray-700 transition-all cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.personalityTraits.includes(trait)}
                          onChange={() => handleCheckboxChange('personalityTraits', trait)}
                          className="w-5 h-5 rounded text-purple-600"
                        />
                        <span className="text-gray-200">{trait}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="transition-all duration-300 ease-in-out">
                  <label className="block text-lg font-medium text-gray-200 mb-3">
                    What Are Your Relationship Goals? (Select Multiple)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {relationshipGoalOptions.map(goal => (
                      <label 
                        key={goal} 
                        className="flex items-center space-x-3 p-3 border-2 border-gray-600 rounded-lg hover:border-purple-500 hover:bg-gray-700 transition-all cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.relationshipGoals.includes(goal)}
                          onChange={() => handleCheckboxChange('relationshipGoals', goal)}
                          className="w-5 h-5 rounded text-purple-600"
                        />
                        <span className="text-gray-200">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.career || formData.interests.length === 0 || formData.personalityTraits.length === 0 || formData.relationshipGoals.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg transform hover:scale-105 duration-200"
              >
                {loading ? 'Creating Your Bio...' : 'Generate My Bio'}
              </button>
            </form>
          </div>

          {/* Bio Display Section */}
          <div className={`transition-opacity duration-500 ease-in-out ${showBio ? 'block' : 'hidden'}`}>
            <div className="flex flex-col space-y-4">
              <h2 className="text-2xl font-semibold text-gray-200">Your Generated Bio</h2>
              <textarea
                value={generatedBio}
                readOnly
                className="w-full h-48 p-4 border-2 border-gray-600 rounded-lg focus:border-purple-500 resize-none bg-gray-700 text-white"
              />
              <button
                onClick={() => setShowBio(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:opacity-90 transition-all shadow-lg transform hover:scale-105 duration-200"
              >
                Generate Another Bio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
