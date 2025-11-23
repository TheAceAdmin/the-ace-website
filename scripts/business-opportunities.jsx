  const { useState } = React;

  // TODO: Replace with your deployed Google Apps Script Web App URL
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwIPW0xg9NuEo4pxBE88YjdZ_yINupoVj5SdpOoeFThbxtQj6uJriIIEHQ6O_FQxwavCg/exec';

  const leadTypeLabels = {
A: 'Commercial / Service Space',
B: 'Stall',
C: 'IN Gate Security Room',
D: 'Additional Opportunity'
  };

  const commercialSpaceOptions = {
'1': 'Old Reception Area (between Tower A & B) - ₹45,000 + EB + Additional charges',
'2': 'Association Room (Old KF Office), Tower D – 1st Floor - ₹30,000 + EB + Additional charges',
'3': 'Small Room next to Community Hall, Tower C – 1st Floor - ₹10,000 + EB + Additional charges',
'4': 'Room at Tower B – Ground Floor - ₹15,000 + EB + Additional charges',
'5': 'Room at Tower C – Ground Floor - ₹20,000 + EB + Additional charges'
  };

  const getCommercialSpaceLabel = (value) => commercialSpaceOptions[value] || '';

  function App() {
const [formData, setFormData] = useState({
    leadType: "",
    // Contact Information
    name: "",
    email: "",
    phone: "",
    alternatePhone: "",
    // Type A: Commercial/Service Spaces
    spaceOption: "",
    businessName: "",
    businessType: "",
    additionalDetails: "",
    // Type B: Stalls
    stallType: "",
    productDescription: "",
    // Type C: IN Gate Security Room
    serviceType: "",
    serviceDescription: "",
    // Type D: Additional Revenue Opportunities
    ideaDescription: "",
});

const [isSubmitting, setIsSubmitting] = useState(false);
const [submitStatus, setSubmitStatus] = useState(null);

const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
};

const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Validate required fields
    if (!formData.leadType) {
        setSubmitStatus({ type: 'error', message: 'Please select a space type.' });
        setIsSubmitting(false);
        return;
    }

    if (!formData.name || !formData.phone || !formData.email) {
        setSubmitStatus({ type: 'error', message: 'Please fill in all required contact fields.' });
        setIsSubmitting(false);
        return;
    }

    // Validate type-specific fields
    if (formData.leadType === 'A' && !formData.spaceOption) {
        setSubmitStatus({ type: 'error', message: 'Please select a space option.' });
        setIsSubmitting(false);
        return;
    }

    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('YOUR_DEPLOYED_SCRIPT_ID')) {
        setSubmitStatus({ type: 'error', message: 'Google Sheet integration is not configured. Please update GOOGLE_SCRIPT_URL with your deployed Apps Script Web App URL.' });
        setIsSubmitting(false);
        return;
    }

    const payload = {
        spaceType: leadTypeLabels[formData.leadType] || formData.leadType,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        alternatePhone: formData.alternatePhone || '',
        businessName: formData.businessName,
        typeOfBusiness: formData.businessType,
        commercialSpaceType: formData.leadType === 'A' ? getCommercialSpaceLabel(formData.spaceOption) : '',
        stallType: formData.leadType === 'B' ? (formData.stallType || '') : '',
        serviceType: formData.leadType === 'C' ? (formData.serviceType || '') : '',
        serviceDescription: formData.leadType === 'C' ? (formData.serviceDescription || '') : '',
        additionalDetails: formData.additionalDetails || '',
        ideaProposal: formData.leadType === 'D' ? (formData.ideaDescription || '') : ''
    };

    try {
        console.log('[Lead Submission] URL:', GOOGLE_SCRIPT_URL);
        console.log('[Lead Submission] Payload:', payload);

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload)
        });

        console.log('[Lead Submission] Response status:', response.status, response.statusText);

        let rawText = '';
        try {
            rawText = await response.text();
            console.log('[Lead Submission] Raw response:', rawText);
        } catch (err) {
            console.warn('[Lead Submission] Unable to read response text:', err);
        }

        if (!response.ok) {
            const hint = response.status === 403
                ? 'Google Apps Script returned 403 (forbidden). Please ensure the Web App is deployed with “Execute as Me” and “Anyone” access.'
                : `Status ${response.status}: ${response.statusText}`;
            throw new Error(`Submission failed. ${hint}`);
        }

        let resultMessage = 'Submitted successfully! We will review and contact you soon.';

        setSubmitStatus({ 
            type: 'success', 
            message: resultMessage
        });

        // Reset form after successful submission
        setTimeout(() => {
            setFormData({
                leadType: "",
                name: "",
                email: "",
                phone: "",
                alternatePhone: "",
                spaceOption: "",
                businessName: "",
                businessType: "",
                additionalDetails: "",
                stallType: "",
                productDescription: "",
                serviceType: "",
                serviceDescription: "",
                ideaDescription: "",
            });
            setSubmitStatus(null);
        }, 3000);

    } catch (error) {
        setSubmitStatus({ 
            type: 'error', 
            message: 'An error occurred. Please try again or contact us directly.' 
        });
    } finally {
        setIsSubmitting(false);
    }
};

return (
    <div className="ace-page">
        {/* Header */}
        <div className="ace-header">
            <div className="ace-header-content">
                <div className="ace-logo-block">
                    <img src="../assets/images/ace_risland_logo.png" alt="ACE by Risland Logo" style={{height: '50px', width: 'auto'}} />
                    <div style={{fontSize: '20px', fontWeight: 600, color: '#000080'}}>THE ACE</div>
                </div>
                <a href="../index.html" className="ace-back-button">
                    ← Back to Home
                </a>
            </div>
        </div>

        {/* Main Content */}
        <div className="ace-main-container">
            {/* Page Title */}
            <h1 className="ace-page-title">Business Opportunities</h1>
            <p className="ace-page-subtitle">Submit your business leads and proposals for available spaces</p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="ace-form-container">
                {/* Lead Type Selection */}
                <div style={{marginBottom: '30px'}}>
                    <div style={{
                        backgroundColor: '#000080',
                        color: 'white',
                        padding: '20px',
                        textAlign: 'center',
                        borderRadius: '8px 8px 0 0',
                        margin: '-30px -30px 30px -30px'
                    }}>
                        <h2 style={{fontSize: '24px', fontWeight: 600, marginBottom: '5px'}}>Space</h2>
                        <p style={{fontSize: '14px', opacity: 0.9}}>Choose the type of opportunity you want to submit</p>
                    </div>
                    <label style={{display: 'block', marginBottom: '15px', fontWeight: 500, color: '#333', fontSize: '14px'}}>
                        Space Type <span style={{color: '#dc2626'}}>*</span>
                    </label>
                    <div className="ace-lead-grid">
                        <button
                            type="button"
                            onClick={() => updateField('leadType', 'A')}
                            style={{
                                padding: '16px',
                                borderRadius: '8px',
                                border: `2px solid ${formData.leadType === 'A' ? '#000080' : '#e5e7eb'}`,
                                backgroundColor: formData.leadType === 'A' ? 'rgba(0, 0, 128, 0.1)' : 'transparent',
                                textAlign: 'left',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            className="text-left transition-all"
                        >
                            <div className="font-semibold text-gray-800 mb-1">Commercial/Service Spaces</div>
                            <div className="text-sm text-gray-600">Rent out available spaces within the community</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => updateField('leadType', 'B')}
                            style={{
                                padding: '16px',
                                borderRadius: '8px',
                                border: `2px solid ${formData.leadType === 'B' ? '#000080' : '#e5e7eb'}`,
                                backgroundColor: formData.leadType === 'B' ? 'rgba(0, 0, 128, 0.1)' : 'transparent',
                                textAlign: 'left',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            className="text-left transition-all"
                        >
                            <div className="font-semibold text-gray-800 mb-1">Stalls for Entrepreneurs</div>
                            <div className="text-sm text-gray-600">Set up stalls for home businesses (₹2000/stall, 6 hours)</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => updateField('leadType', 'C')}
                            style={{
                                padding: '16px',
                                borderRadius: '8px',
                                border: `2px solid ${formData.leadType === 'C' ? '#000080' : '#e5e7eb'}`,
                                backgroundColor: formData.leadType === 'C' ? 'rgba(0, 0, 128, 0.1)' : 'transparent',
                                textAlign: 'left',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            className="text-left transition-all"
                        >
                            <div className="font-semibold text-gray-800 mb-1">IN Gate Security Room</div>
                            <div className="text-sm text-gray-600">ATM or similar essential services</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => updateField('leadType', 'D')}
                            style={{
                                padding: '16px',
                                borderRadius: '8px',
                                border: `2px solid ${formData.leadType === 'D' ? '#000080' : '#e5e7eb'}`,
                                backgroundColor: formData.leadType === 'D' ? 'rgba(0, 0, 128, 0.1)' : 'transparent',
                                textAlign: 'left',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            className="text-left transition-all"
                        >
                            <div className="font-semibold text-gray-800 mb-1">Additional Revenue Opportunities</div>
                            <div className="text-sm text-gray-600">Share your innovative ideas</div>
                        </button>
                    </div>
                </div>

                {/* Contact Information */}
                <div style={{borderTop: '2px solid #eee', paddingTop: '30px', marginTop: '30px'}}>
                    <div style={{
                        backgroundColor: '#000080',
                        color: 'white',
                        padding: '20px',
                        textAlign: 'center',
                        borderRadius: '8px',
                        marginBottom: '30px'
                    }}>
                        <h2 style={{fontSize: '24px', fontWeight: 600, marginBottom: '5px'}}>Contact Information</h2>
                        <p style={{fontSize: '14px', opacity: 0.9}}>Please provide your contact details</p>
                    </div>
                    <div className="ace-two-column-grid">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    fontFamily: "'Poppins', sans-serif",
                                    transition: 'border-color 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#000080'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    fontFamily: "'Poppins', sans-serif",
                                    transition: 'border-color 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#000080'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                inputMode="numeric"
                                pattern="\d*"
                                value={formData.phone}
                                onChange={(e) => {
                                    const digitsOnly = e.target.value.replace(/\D/g, '');
                                    updateField('phone', digitsOnly);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    fontFamily: "'Poppins', sans-serif",
                                    transition: 'border-color 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#000080'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Alternate Phone
                            </label>
                            <input
                                type="tel"
                                inputMode="numeric"
                                pattern="\d*"
                                value={formData.alternatePhone}
                                onChange={(e) => {
                                    const digitsOnly = e.target.value.replace(/\D/g, '');
                                    updateField('alternatePhone', digitsOnly);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    fontFamily: "'Poppins', sans-serif",
                                    transition: 'border-color 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#000080'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                placeholder="Optional alternate contact number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Business Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.businessName}
                                onChange={(e) => updateField('businessName', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    fontFamily: "'Poppins', sans-serif",
                                    transition: 'border-color 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#000080'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                placeholder="Company / Brand name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type of Business <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.businessType}
                                onChange={(e) => updateField('businessType', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    fontFamily: "'Poppins', sans-serif",
                                    transition: 'border-color 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#000080'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                placeholder="e.g., Retail, Food, Fitness"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Type A: Commercial/Service Spaces */}
                {formData.leadType === 'A' && (
                    <div style={{borderTop: '2px solid #eee', paddingTop: '30px', marginTop: '30px'}}>
                        <div style={{
                            backgroundColor: '#000080',
                            color: 'white',
                            padding: '20px',
                            textAlign: 'center',
                            borderRadius: '8px',
                            marginBottom: '30px'
                        }}>
                            <h2 style={{fontSize: '24px', fontWeight: 600, marginBottom: '5px'}}>Commercial/Service Space Details</h2>
                            <p style={{fontSize: '14px', opacity: 0.9}}>Provide details about the space you're interested in</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Space <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.spaceOption}
                                    onChange={(e) => updateField('spaceOption', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 15px',
                                        paddingRight: '40px',
                                        border: '2px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '16px',
                                        fontFamily: "'Poppins', sans-serif",
                                        transition: 'border-color 0.3s ease',
                                        outline: 'none',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none',
                                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 15px center',
                                        backgroundSize: '12px',
                                        cursor: 'pointer'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#000080'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                    required
                                >
                                    <option value="">Select a space</option>
                                    <option value="1">1. Old Reception Area (between Tower A & B) - ₹45,000 + EB + Additional charges</option>
                                    <option value="2">2. Association Room (Old KF Office), Tower D – 1st Floor - ₹30,000 + EB + Additional charges</option>
                                    <option value="3">3. Small Room next to Community Hall, Tower C – 1st Floor - ₹10,000 + EB + Additional charges</option>
                                    <option value="4">4. Room at Tower B – Ground Floor - ₹15,000 + EB + Additional charges</option>
                                    <option value="5">5. Room at Tower C – Ground Floor - ₹20,000 + EB + Additional charges</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                                <textarea
                                    value={formData.additionalDetails}
                                    onChange={(e) => updateField('additionalDetails', e.target.value)}
                                    rows={4}
                                    style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    fontFamily: "'Poppins', sans-serif",
                                    transition: 'border-color 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#000080'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                    placeholder="Any additional information about the lead..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Type B: Stalls */}
                {formData.leadType === 'B' && (
                    <div style={{borderTop: '2px solid #eee', paddingTop: '30px', marginTop: '30px'}}>
                        <div style={{
                            backgroundColor: '#000080',
                            color: 'white',
                            padding: '20px',
                            textAlign: 'center',
                            borderRadius: '8px',
                            marginBottom: '30px'
                        }}>
                            <h2 style={{fontSize: '24px', fontWeight: 600, marginBottom: '5px'}}>Stall Details</h2>
                            <p style={{fontSize: '14px', opacity: 0.9}}>Provide details about your stall business</p>
                        </div>
                        <div style={{backgroundColor: 'rgba(0, 0, 128, 0.1)', border: '1px solid rgba(0, 0, 128, 0.2)', borderRadius: '8px', padding: '16px', marginBottom: '16px'}}>
                            <p style={{fontSize: '14px', color: '#000080'}}>
                                <strong>Note:</strong> Cost ₹2,000 per stall, duration 6 hours.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Stall Type <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.stallType}
                                    onChange={(e) => updateField('stallType', e.target.value)}
                                    style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    fontFamily: "'Poppins', sans-serif",
                                    transition: 'border-color 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#000080'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                    placeholder="e.g., Home Cook, Baker, Product Seller, etc."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product/Service Description</label>
                                <textarea
                                    value={formData.productDescription}
                                    onChange={(e) => updateField('productDescription', e.target.value)}
                                    rows={4}
                                    style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    fontFamily: "'Poppins', sans-serif",
                                    transition: 'border-color 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#000080'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                    placeholder="Describe what you will be selling or offering..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                                <textarea
                                    value={formData.additionalDetails}
                                    onChange={(e) => updateField('additionalDetails', e.target.value)}
                                    rows={3}
                                    style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    fontFamily: "'Poppins', sans-serif",
                                    transition: 'border-color 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#000080'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                    placeholder="Any additional information..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Type C: IN Gate Security Room */}
                {formData.leadType === 'C' && (
                    <div style={{borderTop: '2px solid #eee', paddingTop: '30px', marginTop: '30px'}}>
                        <div style={{
                            backgroundColor: '#000080',
                            color: 'white',
                            padding: '20px',
                            textAlign: 'center',
                            borderRadius: '8px',
                            marginBottom: '30px'
                        }}>
                            <h2 style={{fontSize: '24px', fontWeight: 600, marginBottom: '5px'}}>IN Gate Security Room Details</h2>
                            <p style={{fontSize: '14px', opacity: 0.9}}>Provide details about the service you want to offer</p>
                        </div>
                        <div style={{backgroundColor: 'rgba(0, 0, 128, 0.1)', border: '1px solid rgba(0, 0, 128, 0.2)', borderRadius: '8px', padding: '16px', marginBottom: '16px'}}>
                            <p style={{fontSize: '14px', color: '#000080'}}>
                                This space is currently available since the security moves in near the boom barrier. We recommend exploring options like an ATM or similar essential services.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Service Type <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.serviceType}
                                    onChange={(e) => updateField('serviceType', e.target.value)}
                                    style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    fontFamily: "'Poppins', sans-serif",
                                    transition: 'border-color 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#000080'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                    placeholder="e.g., ATM, Vending Machine, etc."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Description</label>
                                <textarea
                                    value={formData.serviceDescription}
                                    onChange={(e) => updateField('serviceDescription', e.target.value)}
                                    rows={4}
                                    style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    fontFamily: "'Poppins', sans-serif",
                                    transition: 'border-color 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#000080'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                    placeholder="Describe the service, company details, and any relevant information..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                                <textarea
                                    value={formData.additionalDetails}
                                    onChange={(e) => updateField('additionalDetails', e.target.value)}
                                    rows={3}
                                    style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    fontFamily: "'Poppins', sans-serif",
                                    transition: 'border-color 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#000080'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                    placeholder="Any additional information..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Type D: Additional Revenue Opportunities */}
                {formData.leadType === 'D' && (
                    <div style={{borderTop: '2px solid #eee', paddingTop: '30px', marginTop: '30px'}}>
                        <div style={{
                            backgroundColor: '#000080',
                            color: 'white',
                            padding: '20px',
                            textAlign: 'center',
                            borderRadius: '8px',
                            marginBottom: '30px'
                        }}>
                            <h2 style={{fontSize: '24px', fontWeight: 600, marginBottom: '5px'}}>Additional Revenue Opportunity</h2>
                            <p style={{fontSize: '14px', opacity: 0.9}}>Share your innovative ideas and proposals</p>
                        </div>
                        <div style={{backgroundColor: 'rgba(0, 0, 128, 0.1)', border: '1px solid rgba(0, 0, 128, 0.2)', borderRadius: '8px', padding: '16px', marginBottom: '16px'}}>
                            <p style={{fontSize: '14px', color: '#000080'}}>
                                We are open to innovative ideas and proposals that can help enhance our community facilities and services.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Your Idea/Proposal <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.ideaDescription}
                                onChange={(e) => updateField('ideaDescription', e.target.value)}
                                rows={6}
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    fontFamily: "'Poppins', sans-serif",
                                    transition: 'border-color 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#000080'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                placeholder="Please describe your revenue generation idea in detail..."
                                required
                            />
                        </div>
                    </div>
                )}

                {/* Terms and Conditions */}
                <div className="ace-terms">
                    <h3 style={{fontSize: '18px', fontWeight: 600, color: '#bf4408', marginBottom: '12px'}}>Terms &amp; Conditions</h3>
                    <ul style={{listStyle: 'disc', paddingLeft: '20px', marginBottom: '15px', lineHeight: 1.6}}>
                        <li>Opportunities are open to residents as well as trusted external entrepreneurs; however, day-to-day operations must be tailored for THE ACE residents.</li>
                        <li>Access to every listed space is limited to residents and association-approved guests only. External customer walk-ins are not permitted under the current security policy.</li>
                        <li>Vendors must comply with all TAAOWA guidelines, including operating hours, safety norms, and any future policy updates shared during onboarding.</li>
                        <li>Shortlisted partners will be expected to sign a detailed agreement covering rentals, utilities, branding, and service quality expectations.</li>
                    </ul>
                    <label style={{display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', fontWeight: 500}}>
                        <input
                            type="checkbox"
                            required
                            style={{marginTop: '4px', transform: 'scale(1.2)'}}
                        />
                        <span>I acknowledge the above conditions and confirm that my proposal will operate with resident-only access and in alignment with association policies.</span>
                    </label>
                </div>

                {/* Submit Status */}
                {submitStatus && (
                    <div className={`rounded-xl p-4 ${
                        submitStatus.type === 'success' 
                            ? 'bg-green-50 border border-green-200 text-green-800' 
                            : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                        {submitStatus.message}
                    </div>
                )}

                {/* Submit Button */}
                <div className="ace-button-row" style={{paddingTop: '30px', borderTop: '2px solid #eee', marginTop: '30px'}}>
                    <button
                        type="button"
                        onClick={() => {
                            setFormData({
                                leadType: "",
                                name: "",
                                email: "",
                                phone: "",
                                alternatePhone: "",
                                spaceOption: "",
                                businessName: "",
                                businessType: "",
                                additionalDetails: "",
                                stallType: "",
                                productDescription: "",
                                serviceType: "",
                                serviceDescription: "",
                                ideaDescription: "",
                            });
                            setSubmitStatus(null);
                        }}
                        className="ace-reset-button"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`ace-submit-button ${isSubmitting ? 'ace-submit-button--disabled' : ''}`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>

            {/* Information Box */}
            <div className="ace-info-box">
                <h3 style={{fontSize: '18px', fontWeight: 600, color: '#000080', marginBottom: '15px'}}>Important Information</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>We will review all submissions and shortlist the most viable opportunities.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Selected leads will be contacted for further discussions and next steps.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>For any queries, please contact: <a href="mailto:taaowa@aceapartment.org" style={{color: '#000080', textDecoration: 'underline', fontWeight: 500}} onMouseEnter={(e) => e.target.style.color = '#000060'} onMouseLeave={(e) => e.target.style.color = '#000080'}>taaowa@aceapartment.org</a></span>
                    </li>
                </ul>
            </div>

        </div>

        {/* Footer */}
        <div style={{marginTop: '40px', borderTop: '1px solid #eee', backgroundColor: '#ffffff', padding: '20px 0'}}>
            <div style={{maxWidth: '1000px', margin: '0 auto', padding: '0 20px', textAlign: 'center', fontSize: '14px', color: '#666'}}>
                <p style={{fontWeight: 600}}>The Ace Apartment Owners Welfare Association (TAAOWA)</p>
                <p style={{marginTop: '5px'}}>(Reg. No.Chennai South/175/2025. Under TN Apartment Ownership Act 2022)</p>
            </div>
        </div>
    </div>
);
  }

  // Render the app
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
