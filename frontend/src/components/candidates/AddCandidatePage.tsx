import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  emptyCandidateForm,
  type CandidateFormFieldKey,
  type CandidateFieldErrors,
  type CreateCandidateFormData,
} from './candidateFormTypes';
import { hasFieldErrors, validateCandidateForm } from './validateCandidateForm';
import {
  CandidateSubmitError,
  createCandidate,
  type CreateCandidateResponse,
} from '../../services/candidateService';

const FIELD_ORDER: Array<CandidateFormFieldKey | 'cvFile'> = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'address',
  'education',
  'workExperience',
  'cvFile',
];

const AddCandidatePage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateCandidateFormData>({ ...emptyCandidateForm });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [touched, setTouched] = useState<Partial<Record<CandidateFormFieldKey, boolean>>>({});
  const [clientErrors, setClientErrors] = useState<CandidateFieldErrors>({});
  const [serverFieldErrors, setServerFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<CreateCandidateResponse | null>(null);

  const fieldRefs = useRef<Partial<Record<CandidateFormFieldKey | 'cvFile', HTMLElement | null>>>({});

  const setFieldRef = useCallback((key: CandidateFormFieldKey | 'cvFile') => {
    return (el: HTMLElement | null) => {
      fieldRefs.current[key] = el;
    };
  }, []);

  const focusFirstError = useCallback((errors: CandidateFieldErrors & Partial<Record<string, string>>) => {
    for (const key of FIELD_ORDER) {
      if (errors[key]) {
        fieldRefs.current[key]?.focus();
        break;
      }
    }
  }, []);

  const runClientValidation = useCallback(
    (nextForm: CreateCandidateFormData, nextCv: File | null) => {
      return validateCandidateForm(nextForm, nextCv);
    },
    [],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccess(null);
    setBannerError(null);
    setServerFieldErrors({});
  };

  const handleBlur = (field: CandidateFormFieldKey) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = runClientValidation(form, cvFile);
    setClientErrors(errs);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCvFile(file);
    setSuccess(null);
    setBannerError(null);
    setServerFieldErrors({});
    const errs = runClientValidation(form, file);
    setClientErrors(errs);
  };

  const clearCv = () => {
    setCvFile(null);
    const errs = runClientValidation(form, null);
    setClientErrors(errs);
  };

  /** Server errors always show; client errors only after field blur (or after submit). */
  const inlineError = (field: CandidateFormFieldKey | 'cvFile'): string | undefined => {
    if (field === 'cvFile') {
      return serverFieldErrors.cvFile ?? clientErrors.cvFile;
    }
    if (serverFieldErrors[field]) {
      return serverFieldErrors[field];
    }
    if (!touched[field]) {
      return undefined;
    }
    return clientErrors[field];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerError(null);
    setServerFieldErrors({});
    setSuccess(null);

    const allTouched: Partial<Record<CandidateFormFieldKey, boolean>> = {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
      education: true,
      workExperience: true,
    };
    setTouched((prev) => ({ ...prev, ...allTouched }));

    const errs = runClientValidation(form, cvFile);
    setClientErrors(errs);
    if (hasFieldErrors(errs)) {
      focusFirstError(errs);
      return;
    }

    setSubmitting(true);
    try {
      const result = await createCandidate(form, cvFile);
      setSuccess(result);
      setForm({ ...emptyCandidateForm });
      setCvFile(null);
      setClientErrors({});
      setTouched({});
    } catch (err) {
      if (err instanceof CandidateSubmitError) {
        if (err.kind === 'validation' && Object.keys(err.fieldErrors).length > 0) {
          setServerFieldErrors(err.fieldErrors);
          setBannerError(err.message);
          focusFirstError(err.fieldErrors as CandidateFieldErrors);
        } else {
          setBannerError(err.message);
        }
      } else {
        setBannerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAnother = () => {
    setSuccess(null);
    setBannerError(null);
    setClientErrors({});
    setServerFieldErrors({});
  };

  return (
    <Container className="py-4" as="main" data-testid="add-candidate-page">
      <div className="mb-3">
        <Button variant="link" className="ps-0" type="button" onClick={() => navigate('/')}>
          ← Back to dashboard
        </Button>
      </div>

      <h1 className="h3 mb-4">Add candidate</h1>

      {success && (
        <Alert
          variant="success"
          role="status"
          aria-live="polite"
          data-testid="form-success"
          className="mb-4"
          tabIndex={-1}
        >
          <Alert.Heading>Candidate created</Alert.Heading>
          <p className="mb-2">
            Reference: <strong>{success.id}</strong>
          </p>
          <p className="mb-3 text-muted small">
            {success.firstName} {success.lastName} — {success.email}
          </p>
          <Button variant="outline-success" size="sm" onClick={handleAddAnother} data-testid="add-another-candidate">
            Add another candidate
          </Button>
        </Alert>
      )}

      {bannerError && (
        <Alert variant="danger" role="alert" aria-live="assertive" className="mb-4" data-testid="form-banner-error">
          {bannerError}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} noValidate data-testid="candidate-form">
        <Row>
          <Col md={6} className="mb-3">
            <Form.Group controlId="candidate-firstName">
              <Form.Label>First name *</Form.Label>
              <Form.Control
                ref={setFieldRef('firstName') as React.RefCallback<HTMLInputElement>}
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={form.firstName}
                onChange={handleChange}
                onBlur={() => handleBlur('firstName')}
                isInvalid={Boolean(inlineError('firstName'))}
                aria-invalid={Boolean(inlineError('firstName'))}
                aria-describedby={inlineError('firstName') ? 'candidate-firstName-error' : undefined}
                maxLength={120}
              />
              <Form.Control.Feedback type="invalid" id="candidate-firstName-error">
                {inlineError('firstName')}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group controlId="candidate-lastName">
              <Form.Label>Last name *</Form.Label>
              <Form.Control
                ref={setFieldRef('lastName') as React.RefCallback<HTMLInputElement>}
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={form.lastName}
                onChange={handleChange}
                onBlur={() => handleBlur('lastName')}
                isInvalid={Boolean(inlineError('lastName'))}
                aria-invalid={Boolean(inlineError('lastName'))}
                aria-describedby={inlineError('lastName') ? 'candidate-lastName-error' : undefined}
                maxLength={120}
              />
              <Form.Control.Feedback type="invalid" id="candidate-lastName-error">
                {inlineError('lastName')}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-3">
            <Form.Group controlId="candidate-email">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                ref={setFieldRef('email') as React.RefCallback<HTMLInputElement>}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                isInvalid={Boolean(inlineError('email'))}
                aria-invalid={Boolean(inlineError('email'))}
                aria-describedby={inlineError('email') ? 'candidate-email-error' : undefined}
                maxLength={260}
              />
              <Form.Control.Feedback type="invalid" id="candidate-email-error">
                {inlineError('email')}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group controlId="candidate-phone">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                ref={setFieldRef('phone') as React.RefCallback<HTMLInputElement>}
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 415 555 0100"
                value={form.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                isInvalid={Boolean(inlineError('phone'))}
                aria-invalid={Boolean(inlineError('phone'))}
                aria-describedby={inlineError('phone') ? 'candidate-phone-error' : undefined}
                maxLength={40}
              />
              <Form.Control.Feedback type="invalid" id="candidate-phone-error">
                {inlineError('phone')}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3" controlId="candidate-address">
          <Form.Label>Address</Form.Label>
          <Form.Control
            ref={setFieldRef('address') as React.RefCallback<HTMLInputElement>}
            name="address"
            type="text"
            autoComplete="street-address"
            value={form.address}
            onChange={handleChange}
            onBlur={() => handleBlur('address')}
            isInvalid={Boolean(inlineError('address'))}
            aria-invalid={Boolean(inlineError('address'))}
            aria-describedby={inlineError('address') ? 'candidate-address-error' : undefined}
          />
          <Form.Control.Feedback type="invalid" id="candidate-address-error">
            {inlineError('address')}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="candidate-education">
          <Form.Label>Education</Form.Label>
          <Form.Control
            ref={setFieldRef('education') as React.RefCallback<HTMLTextAreaElement>}
            name="education"
            as="textarea"
            rows={4}
            placeholder="Degrees, institutions, certifications…"
            value={form.education}
            onChange={handleChange}
            onBlur={() => handleBlur('education')}
            isInvalid={Boolean(inlineError('education'))}
            aria-invalid={Boolean(inlineError('education'))}
            aria-describedby={inlineError('education') ? 'candidate-education-error' : undefined}
          />
          <Form.Control.Feedback type="invalid" id="candidate-education-error">
            {inlineError('education')}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="candidate-workExperience">
          <Form.Label>Work experience</Form.Label>
          <Form.Control
            ref={setFieldRef('workExperience') as React.RefCallback<HTMLTextAreaElement>}
            name="workExperience"
            as="textarea"
            rows={4}
            placeholder="Roles, companies, dates…"
            value={form.workExperience}
            onChange={handleChange}
            onBlur={() => handleBlur('workExperience')}
            isInvalid={Boolean(inlineError('workExperience'))}
            aria-invalid={Boolean(inlineError('workExperience'))}
            aria-describedby={inlineError('workExperience') ? 'candidate-workExperience-error' : undefined}
          />
          <Form.Control.Feedback type="invalid" id="candidate-workExperience-error">
            {inlineError('workExperience')}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-4" controlId="candidate-cvFile">
          <Form.Label>CV (PDF or DOCX)</Form.Label>
          <Form.Control
            ref={setFieldRef('cvFile') as React.RefCallback<HTMLInputElement>}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            isInvalid={Boolean(inlineError('cvFile'))}
            aria-invalid={Boolean(inlineError('cvFile'))}
            aria-describedby={inlineError('cvFile') ? 'candidate-cvFile-error' : undefined}
            data-testid="candidate-cv-input"
          />
          {cvFile && (
            <div className="small text-muted mt-1">
              Selected: {cvFile.name}{' '}
              <Button type="button" variant="link" size="sm" className="p-0 ms-2" onClick={clearCv}>
                Remove
              </Button>
            </div>
          )}
          <Form.Control.Feedback type="invalid" id="candidate-cvFile-error">
            {inlineError('cvFile')}
          </Form.Control.Feedback>
        </Form.Group>

        <div className="d-flex gap-2 flex-wrap">
          <Button type="submit" variant="primary" disabled={submitting} data-testid="submit-candidate">
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" aria-hidden />
                Saving…
              </>
            ) : (
              'Save candidate'
            )}
          </Button>
          <Button type="button" variant="outline-secondary" disabled={submitting} onClick={() => navigate('/')}>
            Cancel
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AddCandidatePage;
