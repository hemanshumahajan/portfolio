const Footer = () => {
  return (
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-6 text-center">
        <p className="font-mono text-sm text-muted-foreground">
          © {new Date().getFullYear()} • Built with passion & code
        </p>
      </div>
    </footer>
  );
};

export default Footer;
