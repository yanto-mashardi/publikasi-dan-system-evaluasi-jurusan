# Evaluation Engine

## Purpose

Satu mesin evaluasi digunakan lintas domain.

## Evaluation Object

```text
evaluation_id
subject_type
subject_id
period_id
standard_reference
standard_value
actual_value
gap_value
gap_type
analysis
root_cause
evaluator_id
evaluation_date
status
```

## Finding

```text
finding_id
evaluation_id
severity
category
description
is_public_candidate
```

## Recommendation

```text
recommendation_id
evaluation_id
priority
recommendation_text
target_completion
owner_unit_id
status
```

## Follow-up

```text
followup_id
recommendation_id
action_plan
pic_user_id
start_date
due_date
progress_percent
status
```

## Verification

```text
verification_id
followup_id
verifier_id
effective
verification_note
verified_at
```

## Public-Safe Evaluation Summary

Evaluasi internal dapat mempunyai field:

```text
internal_analysis
public_summary
```

`public_summary` tidak menjadi sumber fakta baru. Ia merupakan ringkasan resmi dari evaluasi yang sama dan harus melalui approval.

## Status

Evaluation:

```text
DRAFT
SUBMITTED
VERIFIED
APPROVED
CLOSED
```

Follow-up:

```text
OPEN
IN_PROGRESS
WAITING_VERIFICATION
CLOSED
REOPENED
```
