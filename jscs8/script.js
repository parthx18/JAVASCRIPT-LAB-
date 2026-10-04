/**
 * TitanPulse Gym Admission Portal (Experiment 8)
 * Core JavaScript Logic:
 * - Real-time event validation (input, change, blur, focus)
 * - Dynamic pricing and discounts computation
 * - Live digital membership badge rendering
 * - Admission confirmation generation and printable slip handling
 * - Dedicated preset filling for Parth Vishnu (PRN: 24070521279)
 */

document.addEventListener('DOMContentLoaded', () => {

  // Form & Input elements
  const form = document.getElementById('gymAdmissionForm');
  const fillParthPresetBtn = document.getElementById('fillParthPresetBtn');
  const resetAdmissionBtn = document.getElementById('resetAdmissionBtn');
  const notificationBanner = document.getElementById('formLiveNotification');

  // Fields
  const fullNameInput = document.getElementById('fullName');
  const prnInput = document.getElementById('prnNumber');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const ageInput = document.getElementById('age');
  const genderInput = document.getElementById('gender');
  const bloodGroupInput = document.getElementById('bloodGroup');
  const planInput = document.getElementById('membershipPlan');
  const durationInput = document.getElementById('membershipDuration');
  const slotInput = document.getElementById('trainingSlot');
  const goalInput = document.getElementById('fitnessGoal');
  const emergContactInput = document.getElementById('emergContact');
  const startDateInput = document.getElementById('startDate');
  const termsCheckbox = document.getElementById('termsAgreement');
  const addonCheckboxes = document.querySelectorAll('input[name="addons"]');

  // Ribbon elements
  const ribbonFormStatus = document.getElementById('ribbonFormStatus');
  const ribbonTierName = document.getElementById('ribbonTierName');
  const ribbonTotalAmount = document.getElementById('ribbonTotalAmount');
  const ribbonApplicantName = document.getElementById('ribbonApplicantName');

  // Billing elements
  const billPlanLabel = document.getElementById('billPlanLabel');
  const billBaseRate = document.getElementById('billBaseRate');
  const billDurationLabel = document.getElementById('billDurationLabel');
  const billAddonsRate = document.getElementById('billAddonsRate');
  const billDiscountRow = document.getElementById('billDiscountRow');
  const billDiscountRate = document.getElementById('billDiscountRate');
  const billGrandTotal = document.getElementById('billGrandTotal');

  // Digital Badge elements
  const badgeTierTag = document.getElementById('badgeTierTag');
  const badgeAvatarLetter = document.getElementById('badgeAvatarLetter');
  const badgeUserName = document.getElementById('badgeUserName');
  const badgeUserPrn = document.getElementById('badgeUserPrn');
  const badgeCardId = document.getElementById('badgeCardId');
  const badgeSlot = document.getElementById('badgeSlot');
  const badgeBloodGroup = document.getElementById('badgeBloodGroup');
  const badgeGoal = document.getElementById('badgeGoal');
  const badgeValidFrom = document.getElementById('badgeValidFrom');
  const badgeBarcodeText = document.getElementById('badgeBarcodeText');
  const passStatusChip = document.getElementById('passStatusChip');

  // Confirmation Card elements
  const confirmationCard = document.getElementById('admissionConfirmationCard');
  const confirmMessageText = document.getElementById('confirmMessageText');
  const receiptSummaryBox = document.getElementById('receiptSummaryBox');
  const printReceiptBtn = document.getElementById('printReceiptBtn');
  const newAdmissionBtn = document.getElementById('newAdmissionBtn');

  // Set default start date to today
  const todayStr = new Date().toISOString().split('T')[0];
  startDateInput.value = todayStr;
  startDateInput.min = todayStr;

  // Validation rules definition
  const validators = {
    fullName: (val) => {
      if (!val.trim()) return 'Full name is required.';
      if (val.trim().length < 3) return 'Name must have at least 3 characters.';
      if (!/^[a-zA-Z\s.]+$/.test(val.trim())) return 'Only alphabetical letters and spaces allowed.';
      return '';
    },
    prnNumber: (val) => {
      if (!val.trim()) return 'PRN number is required.';
      if (!/^\d{11}$/.test(val.trim())) return 'PRN must be an 11-digit number (e.g. 24070521279).';
      return '';
    },
    email: (val) => {
      if (!val.trim()) return 'Email address is required.';
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(val.trim())) return 'Enter a valid email format (e.g. user@domain.com).';
      return '';
    },
    phone: (val) => {
      if (!val.trim()) return 'Mobile number is required.';
      const clean = val.replace(/[\s-]/g, '');
      if (!/^\d{10}$/.test(clean)) return 'Phone number must be exactly 10 digits.';
      return '';
    },
    age: (val) => {
      const num = parseInt(val, 10);
      if (isNaN(num)) return 'Please provide your age.';
      if (num < 14 || num > 80) return 'Age must be between 14 and 80 years.';
      return '';
    },
    gender: (val) => (!val ? 'Please select a gender option.' : ''),
    bloodGroup: (val) => (!val ? 'Please select your blood group.' : ''),
    emergContact: (val) => {
      if (!val.trim()) return 'Emergency contact information is mandatory.';
      if (val.trim().length < 5) return 'Include contact person name and telephone number.';
      return '';
    },
    startDate: (val) => (!val ? 'Select start date.' : ''),
    terms: (checked) => (!checked ? 'You must accept gym safety rules to continue.' : '')
  };

  /**
   * Helper to set control state
   */
  function setControlState(controlId, feedbackId, errorMessage) {
    const ctrl = document.getElementById(controlId);
    const fb = document.getElementById(feedbackId);
    if (!ctrl || !fb) return;

    if (errorMessage) {
      ctrl.classList.remove('valid');
      ctrl.classList.add('invalid');
      fb.textContent = errorMessage;
      fb.className = 'field-feedback err';
      return false;
    } else {
      ctrl.classList.remove('invalid');
      ctrl.classList.add('valid');
      fb.textContent = '✓ Looks good';
      fb.className = 'field-feedback ok';
      return true;
    }
  }

  // Real-time Event Listeners for Validation
  fullNameInput.addEventListener('input', () => {
    const err = validators.fullName(fullNameInput.value);
    setControlState('ctrlFullName', 'fbFullName', err);
    updateDynamicBadge();
  });

  prnInput.addEventListener('input', () => {
    const err = validators.prnNumber(prnInput.value);
    setControlState('ctrlPrn', 'fbPrn', err);
    updateDynamicBadge();
  });

  emailInput.addEventListener('input', () => {
    const err = validators.email(emailInput.value);
    setControlState('ctrlEmail', 'fbEmail', err);
  });

  phoneInput.addEventListener('input', () => {
    const err = validators.phone(phoneInput.value);
    setControlState('ctrlPhone', 'fbPhone', err);
  });

  ageInput.addEventListener('input', () => {
    const err = validators.age(ageInput.value);
    setControlState('ctrlAge', 'fbAge', err);
  });

  genderInput.addEventListener('change', () => {
    const err = validators.gender(genderInput.value);
    setControlState('ctrlGender', 'fbGender', err);
  });

  bloodGroupInput.addEventListener('change', () => {
    const err = validators.bloodGroup(bloodGroupInput.value);
    setControlState('ctrlBloodGroup', 'fbBloodGroup', err);
    updateDynamicBadge();
  });

  emergContactInput.addEventListener('input', () => {
    const err = validators.emergContact(emergContactInput.value);
    setControlState('ctrlEmergContact', 'fbEmergContact', err);
  });

  startDateInput.addEventListener('change', () => {
    const err = validators.startDate(startDateInput.value);
    setControlState('ctrlStartDate', 'fbStartDate', err);
    updateDynamicBadge();
  });

  termsCheckbox.addEventListener('change', () => {
    const err = validators.terms(termsCheckbox.checked);
    const fb = document.getElementById('fbTerms');
    if (err) {
      fb.textContent = err;
      fb.className = 'field-feedback err';
    } else {
      fb.textContent = '';
    }
  });

  // Plan and Add-ons computation listeners (change event)
  planInput.addEventListener('change', () => {
    recalculateBilling();
    updateDynamicBadge();
  });

  durationInput.addEventListener('change', () => {
    recalculateBilling();
  });

  slotInput.addEventListener('change', () => {
    updateDynamicBadge();
  });

  goalInput.addEventListener('change', () => {
    updateDynamicBadge();
  });

  addonCheckboxes.forEach(box => {
    box.addEventListener('change', () => {
      recalculateBilling();
    });
  });

  /**
   * Recalculates dynamic pricing, discounts, and billing display
   */
  function recalculateBilling() {
    const selectedPlanOpt = planInput.options[planInput.selectedIndex];
    const baseMonthlyPrice = parseFloat(selectedPlanOpt.getAttribute('data-price')) || 29;
    const planText = selectedPlanOpt.textContent.split('(')[0].trim();

    const selectedDurationOpt = durationInput.options[durationInput.selectedIndex];
    const durationMonths = parseInt(selectedDurationOpt.value, 10) || 1;
    const discountRate = parseFloat(selectedDurationOpt.getAttribute('data-discount')) || 0;

    let addonsMonthlySum = 0;
    addonCheckboxes.forEach(cb => {
      if (cb.checked) {
        addonsMonthlySum += parseFloat(cb.getAttribute('data-addon-price')) || 0;
      }
    });

    const subtotalPerMonth = baseMonthlyPrice + addonsMonthlySum;
    const grossTotal = subtotalPerMonth * durationMonths;
    const discountAmount = grossTotal * discountRate;
    const netGrandTotal = grossTotal - discountAmount;

    // Update Billing Card UI
    billPlanLabel.textContent = planText;
    billBaseRate.textContent = `$${baseMonthlyPrice.toFixed(2)} / mo`;
    billDurationLabel.textContent = selectedDurationOpt.textContent;
    billAddonsRate.textContent = addonsMonthlySum > 0 ? `+$${addonsMonthlySum.toFixed(2)} / mo` : '$0.00';

    if (discountRate > 0) {
      billDiscountRow.style.display = 'flex';
      billDiscountRate.textContent = `-$${discountAmount.toFixed(2)} (${(discountRate * 100).toFixed(0)}% off)`;
    } else {
      billDiscountRow.style.display = 'none';
    }

    billGrandTotal.textContent = `$${netGrandTotal.toFixed(2)}`;

    // Top ribbon update
    ribbonTierName.textContent = `${planText} ($${baseMonthlyPrice}/mo)`;
    ribbonTotalAmount.textContent = `$${netGrandTotal.toFixed(2)}`;

    return {
      planText,
      baseMonthlyPrice,
      durationMonths,
      durationText: selectedDurationOpt.textContent,
      addonsMonthlySum,
      discountAmount,
      netGrandTotal
    };
  }

  /**
   * Dynamically updates the digital admission card preview in real-time
   */
  function updateDynamicBadge() {
    const rawName = fullNameInput.value.trim() || 'Applicant';
    const rawPrn = prnInput.value.trim() || '24070521279';

    badgeUserName.textContent = rawName;
    badgeUserPrn.textContent = rawPrn;
    badgeCardId.textContent = `TP-${rawPrn}`;
    badgeBarcodeText.textContent = `TP-${rawPrn}-OFFICIAL`;

    // Initials avatar
    const nameParts = rawName.split(' ').filter(p => p.length > 0);
    let initials = 'PV';
    if (nameParts.length >= 2) {
      initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else if (nameParts.length === 1) {
      initials = nameParts[0].substring(0, 2).toUpperCase();
    }
    badgeAvatarLetter.textContent = initials;

    // Selected Tier Tag
    const planVal = planInput.value;
    if (planVal === 'elite') {
      badgeTierTag.textContent = 'ELITE TITAN VIP';
      badgeTierTag.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
    } else if (planVal === 'pro') {
      badgeTierTag.textContent = 'PRO ATHLETE';
      badgeTierTag.style.background = 'linear-gradient(90deg, #6366f1, #06b6d4)';
    } else {
      badgeTierTag.textContent = 'STANDARD';
      badgeTierTag.style.background = 'linear-gradient(90deg, #64748b, #475569)';
    }

    // Slot badge
    const slotVal = slotInput.value;
    if (slotVal.includes('Morning')) badgeSlot.textContent = 'Morning (6-9 AM)';
    else if (slotVal.includes('Noon')) badgeSlot.textContent = 'Noon (11-2 PM)';
    else if (slotVal.includes('Evening')) badgeSlot.textContent = 'Evening (5-8 PM)';
    else badgeSlot.textContent = 'Night (8-11 PM)';

    badgeBloodGroup.textContent = bloodGroupInput.value || 'O+';

    // Short Goal
    const goalVal = goalInput.value;
    if (goalVal.includes('Hypertrophy')) badgeGoal.textContent = 'Hypertrophy';
    else if (goalVal.includes('Weight Loss')) badgeGoal.textContent = 'Fat Loss';
    else if (goalVal.includes('Strength')) badgeGoal.textContent = 'Strength';
    else if (goalVal.includes('Agility')) badgeGoal.textContent = 'Agility';
    else badgeGoal.textContent = 'Health';

    badgeValidFrom.textContent = startDateInput.value || 'Immediate';

    // Ribbon name
    ribbonApplicantName.textContent = rawName;
  }

  /**
   * Validate entire form on submit
   */
  function validateEntireForm() {
    let isValid = true;

    const checks = [
      { id: 'ctrlFullName', fb: 'fbFullName', err: validators.fullName(fullNameInput.value) },
      { id: 'ctrlPrn', fb: 'fbPrn', err: validators.prnNumber(prnInput.value) },
      { id: 'ctrlEmail', fb: 'fbEmail', err: validators.email(emailInput.value) },
      { id: 'ctrlPhone', fb: 'fbPhone', err: validators.phone(phoneInput.value) },
      { id: 'ctrlAge', fb: 'fbAge', err: validators.age(ageInput.value) },
      { id: 'ctrlGender', fb: 'fbGender', err: validators.gender(genderInput.value) },
      { id: 'ctrlBloodGroup', fb: 'fbBloodGroup', err: validators.bloodGroup(bloodGroupInput.value) },
      { id: 'ctrlEmergContact', fb: 'fbEmergContact', err: validators.emergContact(emergContactInput.value) },
      { id: 'ctrlStartDate', fb: 'fbStartDate', err: validators.startDate(startDateInput.value) }
    ];

    checks.forEach(chk => {
      const ok = setControlState(chk.id, chk.fb, chk.err);
      if (!ok) isValid = false;
    });

    const termsErr = validators.terms(termsCheckbox.checked);
    const fbTerms = document.getElementById('fbTerms');
    if (termsErr) {
      fbTerms.textContent = termsErr;
      fbTerms.className = 'field-feedback err';
      isValid = false;
    } else {
      fbTerms.textContent = '';
    }

    return isValid;
  }

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const isFormValid = validateEntireForm();

    if (!isFormValid) {
      notificationBanner.className = 'form-notification-banner show err';
      notificationBanner.textContent = '⚠️ Please resolve highlighted validation errors before generating your admission pass.';
      ribbonFormStatus.textContent = 'Errors Detected';
      ribbonFormStatus.style.color = '#e11d48';
      return;
    }

    notificationBanner.className = 'form-notification-banner';
    notificationBanner.textContent = '';

    // Calculation summary
    const bill = recalculateBilling();
    const applicantName = fullNameInput.value.trim();
    const applicantPrn = prnInput.value.trim();
    const regTimestamp = new Date().toLocaleString();
    const receiptId = `REC-TP-${applicantPrn}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Update Ribbon
    ribbonFormStatus.textContent = 'Passed (Approved)';
    ribbonFormStatus.style.color = '#059669';

    // Update Badge Status
    passStatusChip.textContent = 'Pass Active & Verified';
    passStatusChip.className = 'status-chip confirmed';

    // Populate Receipt Confirmation
    confirmMessageText.innerHTML = `Welcome to TitanPulse Gym, <strong>${applicantName}</strong>! Your admission registration under PRN <strong>${applicantPrn}</strong> is confirmed and entered into the master roster.`;

    receiptSummaryBox.innerHTML = `
      <div class="receipt-line"><span>Official Receipt ID:</span><strong>${receiptId}</strong></div>
      <div class="receipt-line"><span>Applicant Full Name:</span><strong>${applicantName}</strong></div>
      <div class="receipt-line"><span>Student / Member PRN:</span><strong>${applicantPrn}</strong></div>
      <div class="receipt-line"><span>Membership Tier:</span><strong>${bill.planText}</strong></div>
      <div class="receipt-line"><span>Plan Term / Validity:</span><strong>${bill.durationText} (Starts ${startDateInput.value})</strong></div>
      <div class="receipt-line"><span>Training Time Slot:</span><strong>${slotInput.value}</strong></div>
      <div class="receipt-line"><span>Emergency Contact:</span><strong>${emergContactInput.value}</strong></div>
      <div class="receipt-line"><span>Total Amount Paid:</span><strong style="color: #059669; font-size: 1.05rem;">$${bill.netGrandTotal.toFixed(2)} USD</strong></div>
      <div class="receipt-line"><span>System Verification Timestamp:</span><strong>${regTimestamp}</strong></div>
    `;

    // Show Confirmation Card
    confirmationCard.style.display = 'block';
    confirmationCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // Fill Preset with Parth Vishnu Details
  fillParthPresetBtn.addEventListener('click', () => {
    fullNameInput.value = 'Parth Vishnu';
    prnInput.value = '24070521279';
    emailInput.value = 'parth.vishnu2407@gmail.com';
    phoneInput.value = '9876543210';
    ageInput.value = '20';
    genderInput.value = 'Male';
    bloodGroupInput.value = 'O+';
    planInput.value = 'pro';
    durationInput.value = '3';
    slotInput.value = 'Morning (06:00 AM - 09:00 AM)';
    goalInput.value = 'Hypertrophy & Muscle Building';
    emergContactInput.value = 'Vishnu (Father) - 9822012345';
    startDateInput.value = todayStr;
    termsCheckbox.checked = true;

    // Reset check validation triggers
    validateEntireForm();
    recalculateBilling();
    updateDynamicBadge();

    notificationBanner.className = 'form-notification-banner show';
    notificationBanner.style.backgroundColor = '#eef2ff';
    notificationBanner.style.borderColor = '#c7d2fe';
    notificationBanner.style.color = '#3730a3';
    notificationBanner.textContent = '✓ Loaded verified preset data for Developer Parth Vishnu (PRN: 24070521279).';
  });

  // Reset Button
  resetAdmissionBtn.addEventListener('click', () => {
    form.reset();
    startDateInput.value = todayStr;
    document.querySelectorAll('.input-control').forEach(ctrl => {
      ctrl.classList.remove('valid', 'invalid');
    });
    document.querySelectorAll('.field-feedback').forEach(fb => {
      fb.textContent = '';
    });
    notificationBanner.className = 'form-notification-banner';
    notificationBanner.textContent = '';
    confirmationCard.style.display = 'none';
    passStatusChip.textContent = 'Awaiting Submission';
    passStatusChip.className = 'status-chip';
    ribbonFormStatus.textContent = 'Awaiting Input';
    ribbonFormStatus.style.color = '';

    recalculateBilling();
    updateDynamicBadge();
  });

  // Print slip
  printReceiptBtn.addEventListener('click', () => {
    window.print();
  });

  // New Admission button in confirmation card
  newAdmissionBtn.addEventListener('click', () => {
    confirmationCard.style.display = 'none';
    form.scrollIntoView({ behavior: 'smooth' });
  });

  // Initial runs
  validateEntireForm();
  recalculateBilling();
  updateDynamicBadge();
});
