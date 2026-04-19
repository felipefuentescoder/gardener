import React from 'react'

const serviceOptions = [
  'Lawn Care',
  'Landscaping',
  'Tree Trimming',
  'Irrigation',
  'Flower Beds',
  'Garden Design'
]

export default function BusinessForm({ data, onChange }) {
  // Handle nested contact changes
  const handleContactChange = (field, value) => {
    onChange({
      ...data,
      contact: { ...data.contact, [field]: value }
    })
  }

  // Handle service toggles
  const toggleService = (service) => {
    const services = data.services?.includes(service)
      ? data.services.filter(s => s !== service)
      : [...(data.services || []), service]
    onChange({ ...data, services })
  }

  return (
    <div className="form-section">
      <h2>Business Information</h2>
      
      <div className="form-group">
        <label>Business Name</label>
        <input
          type="text"
          value={data.businessName || ''}
          onChange={(e) => onChange({ ...data, businessName: e.target.value })}
          placeholder="Your Gardening Business"
        />
      </div>

      <div className="form-group">
        <label>Phone</label>
        <input
          type="tel"
          value={data.contact?.phone || ''}
          onChange={(e) => handleContactChange('phone', e.target.value)}
          placeholder="(555) 123-4567"
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={data.contact?.email || ''}
          onChange={(e) => handleContactChange('email', e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="form-group">
        <label>Address</label>
        <input
          type="text"
          value={data.contact?.address || ''}
          onChange={(e) => handleContactChange('address', e.target.value)}
          placeholder="123 Garden St, City, State"
        />
      </div>

      <div className="form-group">
        <label>Service Area (zip codes or cities)</label>
        <input
          type="text"
          value={data.serviceArea || ''}
          onChange={(e) => onChange({ ...data, serviceArea: e.target.value })}
          placeholder="90210, Beverly Hills, CA"
        />
      </div>

      <div className="form-group">
        <label>Services Offered</label>
        <div className="checkbox-group">
          {serviceOptions.map(service => (
            <label key={service}>
              <input
                type="checkbox"
                checked={data.services?.includes(service) || false}
                onChange={() => toggleService(service)}
              />
              {service}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Years of Experience</label>
        <input
          type="text"
          value={data.experience || ''}
          onChange={(e) => onChange({ ...data, experience: e.target.value })}
          placeholder="10 years"
        />
      </div>

      <div className="form-group">
        <label>Certifications / Licenses</label>
        <textarea
          value={data.certifications || ''}
          onChange={(e) => onChange({ ...data, certifications: e.target.value })}
          placeholder="Licensed & Insured, Certified Arborist..."
        />
      </div>
    </div>
  )
}