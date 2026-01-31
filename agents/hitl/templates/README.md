# HITL Template Repository

This directory contains standardized HITL templates for consistent human-in-the-loop workflows across all repositories.

## Template Types

### 1. Security Changes (HITL-SEC-XXXX)
For security-related changes requiring approval.

### 2. Protected Path Changes (HITL-PROT-XXXX)  
For changes to protected paths requiring governance review.

### 3. External Integrations (HITL-EXT-XXXX)
For new external service integrations.

### 4. Unknown Items (HITL-UNK-XXXX)
For items agents cannot resolve autonomously.

## Usage

1. Copy the appropriate template
2. Fill in all required fields
3. Update status as decisions are made
4. Link to related TODO.toon tasks

## Standard Fields

All HITL files must include:
- **Title**: Short description
- **Status**: Pending/Approved/Rejected/Resolved  
- **Created**: YYYY-MM-DD
- **Related Tasks**: TASK-XXX references
- **Context**: Background information
- **Changes Made**: Specific changes list
- **Why Human Approval**: Governance requirements
- **Impact**: If approved/rejected outcomes
- **Verification Steps**: Completed checks
- **Security Considerations**: Security implications
- **Blast Radius**: Risk assessment
- **Recommendation**: Approve/Reject with reasoning
- **Next Steps**: Post-approval actions
