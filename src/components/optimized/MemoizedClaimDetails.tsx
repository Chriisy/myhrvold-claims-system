import React, { memo } from "react";
import { CustomerInfo } from "@/components/claim-details/CustomerInfo";
import { ProductInfo } from "@/components/claim-details/ProductInfo";
import { IssueDescription } from "@/components/claim-details/IssueDescription";
import { ClaimFiles } from "@/components/claim-details/ClaimFiles";
import { ClaimTimeline } from "@/components/claim-details/ClaimTimeline";
import { QuickActions } from "@/components/claim-details/QuickActions";
import { EconomicInfo } from "@/components/claim-details/EconomicInfo";
import { OrganizationInfo } from "@/components/claim-details/OrganizationInfo";

// Memoized component for customer information
export const MemoizedCustomerInfo = memo(CustomerInfo, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.customer) === JSON.stringify(nextProps.customer);
});

// Memoized component for product information
export const MemoizedProductInfo = memo(ProductInfo, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.product) === JSON.stringify(nextProps.product);
});

// Memoized component for issue description
export const MemoizedIssueDescription = memo(IssueDescription, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.issue) === JSON.stringify(nextProps.issue);
});

// Memoized component for claim files
export const MemoizedClaimFiles = memo(ClaimFiles, (prevProps, nextProps) => {
  return prevProps.files.length === nextProps.files.length &&
         prevProps.files.every((file, index) => 
           file.name === nextProps.files[index]?.name && 
           file.size === nextProps.files[index]?.size
         );
});

// Memoized component for claim timeline
export const MemoizedClaimTimeline = memo(ClaimTimeline, (prevProps, nextProps) => {
  return prevProps.timeline.length === nextProps.timeline.length &&
         prevProps.timeline.every((item, index) => 
           item.date === nextProps.timeline[index]?.date &&
           item.action === nextProps.timeline[index]?.action &&
           item.status === nextProps.timeline[index]?.status
         );
});

// Memoized component for quick actions
export const MemoizedQuickActions = memo(QuickActions, (prevProps, nextProps) => {
  return prevProps.claimId === nextProps.claimId &&
         prevProps.createdBy === nextProps.createdBy;
});

// Memoized component for economic information
export const MemoizedEconomicInfo = memo(EconomicInfo, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});

// Memoized component for organization information
export const MemoizedOrganizationInfo = memo(OrganizationInfo, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});

MemoizedCustomerInfo.displayName = 'MemoizedCustomerInfo';
MemoizedProductInfo.displayName = 'MemoizedProductInfo';
MemoizedIssueDescription.displayName = 'MemoizedIssueDescription';
MemoizedClaimFiles.displayName = 'MemoizedClaimFiles';
MemoizedClaimTimeline.displayName = 'MemoizedClaimTimeline';
MemoizedQuickActions.displayName = 'MemoizedQuickActions';
MemoizedEconomicInfo.displayName = 'MemoizedEconomicInfo';
MemoizedOrganizationInfo.displayName = 'MemoizedOrganizationInfo';