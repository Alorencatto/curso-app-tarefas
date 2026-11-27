import packageJson from "../package.json";

export default function VersionLabel() {
  return (
    <footer className="app-version" aria-label="Versão da aplicação">
      Versão {packageJson.version}
    </footer>
  );
}
