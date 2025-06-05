import Image from "next/image";
import Link from "next/link";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex flex-col">
      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center justify-between flex-1 px-8 py-12 gap-8">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
            Pasión y vocación por servir
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 font-medium drop-shadow">
            Tu primer paso para laborar en el sector público y privado. Formación de calidad, certificación y acceso a una comunidad profesional.
          </p>
          <div className="flex gap-4 flex-col sm:flex-row">
            <Link href="/cursos">
              <button className="bg-[#023474] text-white px-8 py-3 rounded-lg shadow-lg hover:bg-blue-800 font-bold text-xl transition w-full sm:w-auto">Explorar cursos</button>
            </Link>
            <Link href="/auth">
              <button className="bg-white text-[#023474] px-8 py-3 rounded-lg shadow-lg hover:bg-blue-100 font-bold text-xl transition w-full sm:w-auto">AULA VIRTUAL</button>
            </Link>
          </div>
        </div>
        <div className="hidden md:block">
          <Image src="/imagenes/curso_1.jpg" alt="Aula Virtual" width={400} height={300} className="rounded-xl shadow-2xl border-4 border-white" />
        </div>
      </section>

      {/* Áreas Especializadas */}
      <section className="bg-white py-12 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#023474] mb-10">ÁREAS ESPECIALIZADAS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            "Gestión Pública",
            "Recursos Humanos",
            "Ingeniería y Medio Ambiente",
            "Administración",
            "Finanzas y Contabilidad",
            "Derecho",
            "Seguridad Ciudadana",
            "Logística",
            "Informática",
            "Banca y Comercio",
            "Salud"
          ].map(area => (
            <div key={area} className="bg-blue-50 border-l-4 border-[#023474] rounded-lg p-6 shadow hover:scale-105 transition-transform">
              <span className="text-lg font-semibold text-[#023474]">{area}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-12 px-4 bg-gradient-to-r from-blue-800 to-blue-600">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-10">Beneficios</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-white">
          <div className="flex flex-col items-center text-center gap-2">
            <span className="text-4xl">💻</span>
            <span className="font-bold text-lg">Virtual y especializados</span>
            <span>Cursos virtuales enfocados en servidores y funcionarios del sector público y privado.</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <span className="text-4xl">🎓</span>
            <span className="font-bold text-lg">Diploma</span>
            <span>Al finalizar y aprobar el curso podrás optar por una certificación válida y reconocida.</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <span className="text-4xl">⏰</span>
            <span className="font-bold text-lg">Aprende a tu ritmo</span>
            <span>El aula virtual está disponible las 24 horas del día para ti.</span>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <footer className="bg-white py-8 px-4 border-t mt-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2 text-[#023474]">
            <span className="font-bold text-lg">Contáctanos</span>
            <span>📞 948880134</span>
            <span>✉️ contacto@icai.edu.pe</span>
            <span>🏢 Urb Alvarez Thomas A-16, Uchumayo, Arequipa</span>
            <span>🕒 L-V (9 AM a 17 PM)</span>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-6">&copy; {new Date().getFullYear()} ICAI - Instituto de Ciencias Administrativas e Ingeniería Aplicadas</div>
      </footer>
    </div>
  );
} 