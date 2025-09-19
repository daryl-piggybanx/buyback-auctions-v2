import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "~/components/ui/dialog";

export type AgreementStep = "terms" | "privacy" | "auction-rules" | "completed";

export type AgreementsAccepted = {
  terms: boolean;
  privacy: boolean;
  auctionRules: boolean;
}

type LegalDocumentModalProps = {
  isOpen: boolean;
  currentAgreement: AgreementStep;
  onAccept: () => void;
  onDecline: () => void;
}

type AgreementStatusProps = {
  agreementsAccepted: AgreementsAccepted;
  allAgreementsAccepted: boolean;
}

export const getAgreementDetails = (agreementType: AgreementStep) => {
  switch (agreementType) {
    case "terms":
      return {
        title: "Terms of Service",
        pdfPath: "/Terms_of_Service.pdf",
        fileName: "Terms_of_Service.pdf"
      };
    case "privacy":
      return {
        title: "Privacy Policy",
        pdfPath: "/Privacy_Policy.pdf",
        fileName: "Privacy_Policy.pdf"
      };
    case "auction-rules":
      return {
        title: "Auction Rules & Guidelines",
        pdfPath: "/Auction_Rules.pdf",
        fileName: "Auction_Rules.pdf"
      };
    default:
      return { title: "", pdfPath: "", fileName: "" };
  }
};

export const handleDownload = (pdfPath: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = pdfPath;
  link.download = fileName;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({
  isOpen,
  currentAgreement,
  onAccept,
  onDecline
}) => {
  const { title, pdfPath, fileName } = getAgreementDetails(currentAgreement);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onDecline(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden text-white">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{title}</span>
            {/* <button
              onClick={() => handleDownload(pdfPath, fileName)}
              className="flex gap-2 items-center px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button> */}
          </DialogTitle>
          <DialogDescription>
            Please review the {title.toLowerCase()} document below. You can download it for your records.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-[500px] max-h-[60vh] border rounded-lg overflow-hidden">
          <iframe
            src={`${pdfPath}#toolbar=0&navpanes=0&scrollbar=1&page=1&view=FitH`}
            className="w-full h-full"
            title={title}
            style={{ minHeight: '500px' }}
          >
            <div className="flex flex-col justify-center items-center p-8 h-full text-center bg-gray-50">
              <svg className="mb-4 w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mb-4 text-gray-600">
                Your browser doesn't support PDF viewing. Please download the document to read it.
              </p>
              <button
                onClick={() => handleDownload(pdfPath, fileName)}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Download {title}
              </button>
            </div>
          </iframe>
        </div>
        
        <DialogFooter className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-4 items-center">
            <button
              onClick={() => handleDownload(pdfPath, fileName)}
              className="flex gap-2 items-center px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download for Records
            </button>
            <span className="text-sm text-gray-200">
              Step {currentAgreement === "terms" ? "1" : currentAgreement === "privacy" ? "2" : "3"} of 3
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onDecline}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currentAgreement === "auction-rules" ? "Accept & Complete" : "Accept & Continue"}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const AgreementStatus: React.FC<AgreementStatusProps> = ({
  agreementsAccepted,
  allAgreementsAccepted
}) => {
  return (
    <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
      <p className="mb-2 text-sm text-blue-800">
        <strong>Required Agreements:</strong>
      </p>
      <div className="space-y-1 text-xs">
        <div className={`flex items-center ${agreementsAccepted.terms ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-2">{agreementsAccepted.terms ? '✓' : '○'}</span>
          Terms of Service
          {agreementsAccepted.terms && (
            <button
              onClick={() => handleDownload("/Terms_of_Service.pdf", "Terms_of_Service.pdf")}
              className="ml-2 text-blue-600 hover:text-blue-800"
              title="Download Terms of Service"
            >
              📄
            </button>
          )}
        </div>
        <div className={`flex items-center ${agreementsAccepted.privacy ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-2">{agreementsAccepted.privacy ? '✓' : '○'}</span>
          Privacy Policy
          {agreementsAccepted.privacy && (
            <button
              onClick={() => handleDownload("/Privacy_Policy.pdf", "Privacy_Policy.pdf")}
              className="ml-2 text-blue-600 hover:text-blue-800"
              title="Download Privacy Policy"
            >
              📄
            </button>
          )}
        </div>
        <div className={`flex items-center ${agreementsAccepted.auctionRules ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-2">{agreementsAccepted.auctionRules ? '✓' : '○'}</span>
          Auction Rules
          {agreementsAccepted.auctionRules && (
            <button
              onClick={() => handleDownload("/Auction_Rules.pdf", "Auction_Rules.pdf")}
              className="ml-2 text-blue-600 hover:text-blue-800"
              title="Download Auction Rules"
            >
              📄
            </button>
          )}
        </div>
      </div>
      {!allAgreementsAccepted && (
        <p className="mt-2 text-xs text-blue-600">
          Click "Create Account" to review and accept all required agreements.
        </p>
      )}
    </div>
  );
};

// Custom hook for managing legal agreement flow
export const useLegalAgreements = () => {
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [currentAgreement, setCurrentAgreement] = useState<AgreementStep>("terms");
  const [agreementsAccepted, setAgreementsAccepted] = useState<AgreementsAccepted>({
    terms: false,
    privacy: false,
    auctionRules: false
  });

  const allAgreementsAccepted = () => {
    return agreementsAccepted.terms && agreementsAccepted.privacy && agreementsAccepted.auctionRules;
  };

  const startAgreementFlow = () => {
    setCurrentAgreement("terms");
    setShowAgreementModal(true);
  };

  const handleAgreementAccept = () => {
    const updatedAgreements = { ...agreementsAccepted };
    
    switch (currentAgreement) {
      case "terms":
        updatedAgreements.terms = true;
        setAgreementsAccepted(updatedAgreements);
        setCurrentAgreement("privacy");
        break;
      case "privacy":
        updatedAgreements.privacy = true;
        setAgreementsAccepted(updatedAgreements);
        setCurrentAgreement("auction-rules");
        break;
      case "auction-rules":
        updatedAgreements.auctionRules = true;
        setAgreementsAccepted(updatedAgreements);
        setCurrentAgreement("completed");
        setShowAgreementModal(false);
        break;
      default:
        setShowAgreementModal(false);
    }
  };

  const handleAgreementDecline = () => {
    setShowAgreementModal(false);
    setAgreementsAccepted({
      terms: false,
      privacy: false,
      auctionRules: false
    });
    return false; // Return false to indicate user declined
  };

  const resetAgreements = () => {
    setAgreementsAccepted({
      terms: false,
      privacy: false,
      auctionRules: false
    });
    setShowAgreementModal(false);
  };

  return {
    showAgreementModal,
    currentAgreement,
    agreementsAccepted,
    allAgreementsAccepted: allAgreementsAccepted(),
    startAgreementFlow,
    handleAgreementAccept,
    handleAgreementDecline,
    resetAgreements
  };
};

// Add useState import at the top
import { useState } from "react";
