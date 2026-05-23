const express = require('express');
const {
  generateBilling,
  getBillingByEntryId
} = require('../controllers/billingController');
const { validateRequest } = require('../middleware/validateRequest');
const {
  billingGenerationValidationRules,
  entryIdValidationRules
} = require('../validators/billingValidators');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    service: 'billing-service',
    status: 'running',
    message: 'Billing Service is working'
  });
});

router.post('/generate', billingGenerationValidationRules, validateRequest, generateBilling);
router.get('/entry/:entryId', entryIdValidationRules, validateRequest, getBillingByEntryId);

module.exports = router;
