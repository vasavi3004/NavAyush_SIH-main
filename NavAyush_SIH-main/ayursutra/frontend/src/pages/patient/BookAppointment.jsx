import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '../../hooks/useAppointments';
import { practitionerAPI, treatmentAPI } from '../../services/api';

const BookAppointment = () => {
  const navigate = useNavigate();
  const { bookAppointment, loading } = useAppointments();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    treatmentType: '',
    practitionerId: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    notes: '',
    isUrgent: false
  });
  
  const [allPractitioners, setAllPractitioners] = useState([]);
  const [filteredPractitioners, setFilteredPractitioners] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);
  const [selectedTreatment, setSelectedTreatment] = useState(null);

  // Enhanced mock data with better practitioner-treatment mapping
  const mockTreatments = [
    { id: 'abhyanga', name: 'Abhyanga', duration: 60, description: 'Full body oil massage therapy' },
    { id: 'shirodhara', name: 'Shirodhara', duration: 90, description: 'Continuous oil pouring on forehead' },
    { id: 'swedana', name: 'Swedana', duration: 45, description: 'Herbal steam therapy' },
    { id: 'panchakarma', name: 'Panchakarma Consultation', duration: 30, description: 'Treatment planning session' },
    { id: 'nasya', name: 'Nasya', duration: 30, description: 'Nasal administration of medicines' },
    { id: 'basti', name: 'Basti', duration: 75, description: 'Medicated enema therapy' }
  ];

  // Enhanced practitioners with clear treatment specialization
  const mockPractitioners = [
    {
      id: 1,
      fullName: 'Dr. Priya Sharma',
      specialization: 'Panchakarma Specialist',
      experience: '15 years',
      rating: 4.9,
      image: '/api/placeholder/64/64',
      treatments: ['abhyanga', 'shirodhara', 'swedana'],
      description: 'Specialized in detoxification therapies'
    },
    {
      id: 2,
      fullName: 'Dr. Rajesh Kumar',
      specialization: 'Ayurvedic Physician',
      experience: '12 years',
      rating: 4.8,
      image: '/api/placeholder/64/64',
      treatments: ['panchakarma', 'nasya', 'basti'],
      description: 'Expert in classical Ayurvedic treatments'
    },
    {
      id: 3,
      fullName: 'Dr. Meera Patel',
      specialization: 'Women\'s Health Specialist',
      experience: '10 years',
      rating: 4.9,
      image: '/api/placeholder/64/64',
      treatments: ['abhyanga', 'shirodhara', 'panchakarma'],
      description: 'Focused on women\'s wellness and hormonal balance'
    },
    {
      id: 4,
      fullName: 'Dr. T. Vasavi',
      specialization: 'Therapeutic Massage Specialist',
      experience: '9 years',
      rating: 4.9,
      image: '/api/placeholder/64/64',
      treatments: ['abhyanga', 'swedana'],
      description: 'Expert in therapeutic massage techniques'
    },
    {
      id: 5,
      fullName: 'Dr. Arun Joshi',
      specialization: 'Nasya & Basti Specialist',
      experience: '11 years',
      rating: 4.7,
      image: '/api/placeholder/64/64',
      treatments: ['nasya', 'basti', 'panchakarma'],
      description: 'Specialized in nasal and enema therapies'
    }
  ];

  const mockTimeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  useEffect(() => {
    // Initialize with all data
    setTreatments(mockTreatments);
    setAllPractitioners(mockPractitioners);
    setFilteredPractitioners(mockPractitioners);
  }, []);

  // Filter practitioners based on selected treatment
  useEffect(() => {
    if (formData.treatmentType) {
      const treatment = treatments.find(t => t.id === formData.treatmentType);
      setSelectedTreatment(treatment);
      
      // Filter practitioners who specialize in this treatment
      const availablePractitioners = allPractitioners.filter(practitioner => 
        practitioner.treatments.includes(formData.treatmentType)
      );
      setFilteredPractitioners(availablePractitioners);
      
      // Reset practitioner selection if current selection is not available for new treatment
      if (formData.practitionerId) {
        const previouslySelected = availablePractitioners.find(
          p => p.id === parseInt(formData.practitionerId)
        );
        if (!previouslySelected) {
          setFormData(prev => ({ ...prev, practitionerId: '' }));
          setSelectedPractitioner(null);
        }
      }
    } else {
      // If no treatment selected, show all practitioners
      setFilteredPractitioners(allPractitioners);
      setSelectedTreatment(null);
    }
  }, [formData.treatmentType, allPractitioners, treatments]);

  useEffect(() => {
    if (formData.treatmentType && formData.scheduledDate) {
      setAvailableSlots(mockTimeSlots);
    }
  }, [formData.treatmentType, formData.scheduledDate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'treatmentType') {
      const treatment = treatments.find(t => t.id === value);
      if (treatment) {
        setFormData(prev => ({ ...prev, duration: treatment.duration }));
      }
    }
    
    if (field === 'practitionerId') {
      const practitioner = filteredPractitioners.find(p => p.id === parseInt(value));
      setSelectedPractitioner(practitioner);
    }
  };

  const handleTreatmentSelect = (treatmentId) => {
    handleInputChange('treatmentType', treatmentId);
  };

  const handlePractitionerSelect = (practitionerId) => {
    handleInputChange('practitionerId', practitionerId.toString());
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await bookAppointment(formData);
      setStep(5);
    } catch (error) {
      console.error('Failed to book appointment:', error);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.treatmentType;
      case 2:
        return formData.practitionerId && filteredPractitioners.length > 0;
      case 3:
        return formData.scheduledDate && formData.scheduledTime;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get practitioners who specialize in the selected treatment
  const getTreatmentSpecialists = (treatmentId) => {
    return allPractitioners.filter(practitioner => 
      practitioner.treatments.includes(treatmentId)
    );
  };

  // Render treatment cards with practitioner count
  const renderTreatmentCard = (treatment) => {
    const specialistCount = getTreatmentSpecialists(treatment.id).length;
    const isSelected = formData.treatmentType === treatment.id;
    
    return (
      <div
        key={treatment.id}
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
          isSelected
            ? 'border-green-500 bg-green-50 shadow-md'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}
        onClick={() => handleTreatmentSelect(treatment.id)}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-800">{treatment.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{treatment.description}</p>
          </div>
          <div className={`flex items-center text-sm px-2 py-1 rounded-full ${
            isSelected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
          }`}>
            <User className="h-3 w-3 mr-1" />
            <span>{specialistCount} specialist{specialistCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>{treatment.duration} minutes</span>
        </div>
        
        {/* Show specialists when treatment is selected */}
        {isSelected && specialistCount > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Available Specialists:</p>
            <div className="flex flex-wrap gap-1">
              {getTreatmentSpecialists(treatment.id).map(practitioner => (
                <span 
                  key={practitioner.id} 
                  className="bg-white px-2 py-1 rounded text-xs text-blue-700 border border-blue-200"
                >
                  {practitioner.fullName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render practitioner cards
  const renderPractitionerCard = (practitioner) => {
    const isSelected = formData.practitionerId === practitioner.id.toString();
    const practitionerTreatments = practitioner.treatments.map(t => 
      treatments.find(treatment => treatment.id === t)?.name
    ).filter(Boolean);

    return (
      <div
        key={practitioner.id}
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
          isSelected
            ? 'border-green-500 bg-green-50 shadow-md'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}
        onClick={() => handlePractitionerSelect(practitioner.id)}
      >
        <div className="flex items-start space-x-4">
          <img
            src={practitioner.image}
            alt={practitioner.fullName}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{practitioner.fullName}</h3>
                <p className="text-sm text-gray-600">{practitioner.specialization}</p>
                <p className="text-sm text-gray-500 mt-1">{practitioner.description}</p>
              </div>
              <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                ⭐ {practitioner.rating}
              </div>
            </div>
            <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500">
              <span>📅 {practitioner.experience} experience</span>
            </div>
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-600">Specializes in:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {practitionerTreatments.map((treatmentName, index) => (
                  <span 
                    key={index} 
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                  >
                    {treatmentName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (step === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Appointment Booked Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your appointment has been scheduled and you will receive a confirmation shortly.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Appointment Details:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Treatment:</strong> {selectedTreatment?.name}</p>
                <p><strong>Practitioner:</strong> {selectedPractitioner?.fullName}</p>
                <p><strong>Date:</strong> {new Date(formData.scheduledDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {formData.scheduledTime}</p>
                <p><strong>Duration:</strong> {formData.duration} minutes</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/patient/dashboard')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setFormData({
                    treatmentType: '',
                    practitionerId: '',
                    scheduledDate: '',
                    scheduledTime: '',
                    duration: 60,
                    notes: '',
                    isUrgent: false
                  });
                  setSelectedPractitioner(null);
                  setSelectedTreatment(null);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Book Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Book Appointment</h1>
            <p className="text-gray-600 mt-1">Schedule your next Panchakarma session</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  stepNum <= step 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-24 h-1 mx-2 ${
                    stepNum < step ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Treatment</span>
            <span>Practitioner</span>
            <span>Date & Time</span>
            <span>Confirm</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {/* Step 1: Select Treatment */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Select Treatment Type</h2>
              
              {formData.treatmentType && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-800">
                        Selected: {selectedTreatment?.name}
                      </h4>
                      <p className="text-sm text-blue-600 mt-1">
                        {selectedTreatment?.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleTreatmentSelect('')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Change Treatment
                    </button>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {treatments.map(renderTreatmentCard)}
              </div>
            </div>
          )}

          {/* Step 2: Select Practitioner */}
          {step === 2 && (
            <div>
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">
                  Treatment: {selectedTreatment?.name}
                </h3>
                <p className="text-sm text-green-600">
                  {selectedTreatment?.description} • {selectedTreatment?.duration} minutes
                </p>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Choose Your Practitioner
              </h2>
              
              {filteredPractitioners.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No practitioners available for {selectedTreatment?.name} at the moment.</p>
                  <button
                    onClick={() => setStep(1)}
                    className="mt-4 text-green-600 hover:text-green-700 font-medium"
                  >
                    ← Choose a different treatment
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPractitioners.map(renderPractitionerCard)}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Date and Time */}
          {step === 3 && (
            <div>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">Treatment Details</h4>
                    <p className="text-sm text-gray-600">{selectedTreatment?.name}</p>
                    <p className="text-sm text-gray-500">{selectedTreatment?.duration} minutes</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Practitioner</h4>
                    <p className="text-sm text-gray-600">{selectedPractitioner?.fullName}</p>
                    <p className="text-sm text-gray-500">{selectedPractitioner?.specialization}</p>
                  </div>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Select Date & Time</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    min={getMinDate()}
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                {formData.scheduledDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Time Slots
                    </label>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          className={`p-2 text-sm rounded-lg border transition-colors ${
                            formData.scheduledTime === slot
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                          }`}
                          onClick={() => handleInputChange('scheduledTime', slot)}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Confirm Your Appointment</h2>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-3">Treatment Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Treatment:</span>
                        <span className="font-medium">{selectedTreatment?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{formData.duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{new Date(formData.scheduledDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{formData.scheduledTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-800 mb-3">Practitioner</h3>
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedPractitioner?.image}
                        alt={selectedPractitioner?.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{selectedPractitioner?.fullName}</p>
                        <p className="text-sm text-gray-600">{selectedPractitioner?.specialization}</p>
                        <p className="text-xs text-gray-500">⭐ {selectedPractitioner?.rating} rating</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Any specific concerns or requests..."
                />
              </div>

              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={formData.isUrgent}
                  onChange={(e) => handleInputChange('isUrgent', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="urgent" className="ml-2 text-sm text-gray-700">
                  This is an urgent appointment
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={step === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                step === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Previous
            </button>
            
            <button
              onClick={step === 4 ? handleSubmit : handleNext}
              disabled={!isStepValid() || loading}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                !isStepValid() || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {loading ? 'Booking...' : step === 4 ? 'Confirm Booking' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;