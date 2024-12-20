import { useState } from 'react'
import './App.css'

// Main App component that handles the bio generation form and display
function App() {
  // State management for form data, generated bio, loading state, display state and errors
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

  // Predefined options for the career dropdown
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

  // Predefined options for interests checkboxes
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

  // Predefined options for personality trait checkboxes
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

  // Predefined options for relationship goal checkboxes
  const relationshipGoalOptions = [
    'Casual',
    'Long-term',
    'Adventurous',
    'Seeking Deep Connection',
    'Friendship First',
    'Marriage Minded'
  ]

  // Handler for career dropdown changes
  const handleCareerChange = (e) => {
    setFormData({...formData, career: e.target.value})
  }

  // Handler for checkbox changes (interests, personality traits, relationship goals)
  const handleCheckboxChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }))
  }

  // Form submission handler with API calls and error handling
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
  
    try {
      // Health check to ensure server is running
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
  
      // API call to generate bio
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

  // Main UI render with gradient background and form components
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8 rounded-3xl shadow-[0_0_25px_8px_rgba(255,182,193,0.2),0_0_50px_15px_rgba(135,206,235,0.2)]">
      <div className="max-w-4xl mx-auto">
        {/* Header section with title and description */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight font-serif italic bg-clip-text text-transparent bg-gradient-to-r from-pink-100 via-purple-300 to-indigo-200 animate-gradient-x transform hover:scale-105 transition-transform duration-300 cursor-pointer" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
            ✨ Dinner Tonight ✨
          </h1>
          <p className="text-xl text-white opacity-90">
            Generate a unique bio that captures your essence
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
          {/* Error message display */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Form section with career, interests, personality, and relationship goals */}
          <div className={`transition-opacity duration-500 ease-in-out ${showBio ? 'hidden' : 'block'}`}>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                {/* Career selection dropdown */}
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

                {/* Interests selection checkboxes */}
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

                {/* Personality traits selection checkboxes */}
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

                {/* Relationship goals selection checkboxes */}
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

              {/* Submit button with validation and loading state */}
              <button
                type="submit"
                disabled={loading || !formData.career || formData.interests.length === 0 || formData.personalityTraits.length === 0 || formData.relationshipGoals.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg transform hover:scale-105 duration-200"
              >
                {loading ? 'Creating Your Bio...' : 'Generate My Bio'}
              </button>
            </form>
          </div>

          {/* Generated bio display section */}
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
