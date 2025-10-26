const express = require('express');
const router = express.Router();
const SubsidyApplication = require('../models/SubsidyApplication');
const User = require('../models/User');

// Submit subsidy application
router.post('/applications', async (req, res) => {
  try {
    const application = new SubsidyApplication({
      ...req.body,
      statusHistory: [{
        status: 'SUBMITTED',
        timestamp: new Date(),
        comment: 'Application submitted successfully'
      }]
    });

    await application.save();
    res.status(201).json(application);
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Get application by ID
router.get('/applications/:id', async (req, res) => {
  try {
    const application = await SubsidyApplication.findById(req.params.id)
      .populate('user')
      .populate('order');
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Get applications by user
router.get('/applications/user/:userId', async (req, res) => {
  try {
    const applications = await SubsidyApplication.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('order');
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Check subsidy eligibility
router.post('/check-eligibility', async (req, res) => {
  try {
    const { aadharNumber, farmerIdCard, state, landArea } = req.body;

    // Basic eligibility criteria
    let isEligible = false;
    let eligibilityReasons = [];
    let subsidyPercentage = 0;

    if (!aadharNumber) {
      eligibilityReasons.push('Aadhar number is required');
    }

    if (farmerIdCard) {
      isEligible = true;
      subsidyPercentage += 30;
      eligibilityReasons.push('Valid farmer ID card holder');
    }

    if (landArea && landArea <= 2) {
      // Small farmer - more subsidy
      subsidyPercentage += 20;
      eligibilityReasons.push('Small farmer (land area <= 2 hectares)');
      isEligible = true;
    } else if (landArea && landArea <= 5) {
      // Medium farmer
      subsidyPercentage += 15;
      eligibilityReasons.push('Medium farmer (land area <= 5 hectares)');
      isEligible = true;
    }

    // State-specific subsidies (example)
    const highSubsidyStates = ['Bihar', 'Uttar Pradesh', 'Madhya Pradesh', 'Jharkhand', 'Odisha'];
    if (highSubsidyStates.includes(state)) {
      subsidyPercentage += 10;
      eligibilityReasons.push(`Additional subsidy for ${state} state`);
      isEligible = true;
    }

    res.json({
      isEligible,
      subsidyPercentage: Math.min(subsidyPercentage, 50), // Cap at 50%
      eligibilityReasons,
      schemes: [
        {
          name: 'Soil Health Card Scheme',
          percentage: 15,
          description: 'Subsidy for fertilizers based on soil testing'
        },
        {
          name: 'Organic Farming Promotion',
          percentage: 25,
          description: 'Higher subsidy for organic fertilizers and manure'
        },
        {
          name: 'Small Farmer Support',
          percentage: 20,
          description: 'Additional support for farmers with less than 2 hectares'
        }
      ]
    });
  } catch (error) {
    console.error('Error checking eligibility:', error);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
});

// Update application status (Admin)
router.patch('/applications/:id/status', async (req, res) => {
  try {
    const { status, comment, approvedAmount, rejectionReason } = req.body;
    
    const application = await SubsidyApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.status = status;
    application.statusHistory.push({
      status,
      timestamp: new Date(),
      comment,
      updatedBy: 'Admin'
    });

    if (status === 'APPROVED' && approvedAmount) {
      application.approvedAmount = approvedAmount;
    }

    if (status === 'REJECTED' && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }

    if (status === 'DISBURSED') {
      application.disbursementDate = new Date();
      application.transactionId = `TXN${Date.now()}`;
    }

    await application.save();
    res.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Get all subsidy schemes
router.get('/schemes', async (req, res) => {
  try {
    const schemes = [
      {
        id: 1,
        name: 'Soil Health Card Scheme',
        description: 'Get subsidized fertilizers based on your soil health report',
        subsidyPercentage: '15-20%',
        eligibility: 'All farmers with soil health card',
        icon: '🏞️'
      },
      {
        id: 2,
        name: 'Paramparagat Krishi Vikas Yojana (PKVY)',
        description: 'Organic farming support with up to 50% subsidy',
        subsidyPercentage: '25-50%',
        eligibility: 'Farmers practicing organic farming',
        icon: '🌿'
      },
      {
        id: 3,
        name: 'National Food Security Mission (NFSM)',
        description: 'Subsidy on seeds, fertilizers and equipment',
        subsidyPercentage: '20-30%',
        eligibility: 'All registered farmers',
        icon: '🌾'
      },
      {
        id: 4,
        name: 'PM-KISAN Samman Nidhi',
        description: 'Direct income support of ₹6000/year',
        subsidyPercentage: 'Fixed ₹6000',
        eligibility: 'Small farmers with less than 2 hectares',
        icon: '💰'
      },
      {
        id: 5,
        name: 'Fertilizer Subsidy Scheme',
        description: 'Direct subsidy on government-approved fertilizers',
        subsidyPercentage: '15-25%',
        eligibility: 'All farmers',
        icon: '🧪'
      }
    ];
    
    res.json(schemes);
  } catch (error) {
    console.error('Error fetching schemes:', error);
    res.status(500).json({ error: 'Failed to fetch schemes' });
  }
});

module.exports = router;
