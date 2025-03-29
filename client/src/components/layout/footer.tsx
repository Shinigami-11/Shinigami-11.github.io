import { HelpCircle, Info, MessageCircle, FileText } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-4">
      <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
        <p>QuizParserinator &copy; {new Date().getFullYear()} | Study Reader Application</p>
        <div className="flex justify-center space-x-4 mt-2">
          <span className="flex items-center hover:text-primary cursor-pointer">
            <HelpCircle className="w-4 h-4 mr-1" />
            Help
          </span>
          <span className="flex items-center hover:text-primary cursor-pointer">
            <Info className="w-4 h-4 mr-1" />
            About
          </span>
          <span className="flex items-center hover:text-primary cursor-pointer">
            <MessageCircle className="w-4 h-4 mr-1" />
            Contact
          </span>
          <Link href="/terms">
            <span className="flex items-center hover:text-primary cursor-pointer">
              <FileText className="w-4 h-4 mr-1" />
              Terms of Service
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
