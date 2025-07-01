"use client";

import { useEffect, useState } from "react";
import { Download, Trash2, GraduationCap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Registration {
  id: string;
  namaLengkap: string;
  nik: string;
  nisn: string;
  noHp: string;
  email: string;
  tanggalLahir: string;
  alamat: string;
  fakultas: string;
  programStudi: string;
  dokumenPath: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch("/api/registrations");
      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch registration data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    console.log("Delete registration:", id);
    toast({
      title: "Delete",
      description: `Delete functionality for ID: ${id} (Not implemented yet)`,
    });
  };

  const handleDownload = async (id: string) => {
    try {
      const response = await fetch(`/api/registrations/download?id=${id}`);
      if (!response.ok) {
        throw new Error("Download failed");
      }

      const contentDisposition = response.headers.get("content-disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : `registrasi-${id}.csv`;

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: `File ${filename} downloaded successfully`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDownloadAll = async () => {
    try {
      const response = await fetch("/api/registrations/download-all");
      if (!response.ok) {
        throw new Error("Download all failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `all-registrations-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "All registration data downloaded successfully",
      });
    } catch (error) {
      console.error("Download all error:", error);
      toast({
        title: "Error",
        description: "Failed to download all data",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-lg w-64 mb-6"></div>
            <div className="h-96 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg text-white">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-1">
                Dashboard Registrasi
              </h1>
              <p className="text-sm md:text-base text-slate-600">
                Kelola data registrasi mahasiswa dengan mudah dan efisien
              </p>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 rounded-t-xl">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
                Data Registrasi Mahasiswa
              </CardTitle>
              <Button
                onClick={handleDownloadAll}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Semua
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-slate-200">
                    <TableHead className="h-14 px-6 font-semibold text-slate-700">
                      No
                    </TableHead>
                    <TableHead className="h-14 px-6 font-semibold text-slate-700">
                      Nama Lengkap
                    </TableHead>
                    <TableHead className="h-14 px-6 font-semibold text-slate-700">
                      NIK
                    </TableHead>
                    <TableHead className="h-14 px-6 font-semibold text-slate-700">
                      NISN
                    </TableHead>
                    <TableHead className="h-14 px-6 font-semibold text-slate-700">
                      Email
                    </TableHead>
                    <TableHead className="h-14 px-6 font-semibold text-slate-700">
                      No. HP
                    </TableHead>
                    <TableHead className="h-14 px-6 font-semibold text-slate-700">
                      Fakultas
                    </TableHead>
                    <TableHead className="h-14 px-6 font-semibold text-slate-700">
                      Program Studi
                    </TableHead>
                    <TableHead className="h-14 px-6 font-semibold text-slate-700">
                      Tanggal Daftar
                    </TableHead>
                    <TableHead className="h-14 px-6 text-center font-semibold text-slate-700">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration, index) => (
                    <TableRow
                      key={registration.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b border-slate-100"
                    >
                      <TableCell className="p-6 font-medium text-slate-600">
                        {index + 1}
                      </TableCell>
                      <TableCell className="p-6 font-semibold text-slate-800">
                        {registration.namaLengkap}
                      </TableCell>
                      <TableCell className="p-6 text-slate-600">
                        {registration.nik}
                      </TableCell>
                      <TableCell className="p-6 text-slate-600">
                        {registration.nisn}
                      </TableCell>
                      <TableCell className="p-6 text-slate-600">
                        {registration.email}
                      </TableCell>
                      <TableCell className="p-6 text-slate-600">
                        {registration.noHp}
                      </TableCell>
                      <TableCell className="p-6 text-slate-600">
                        {registration.fakultas}
                      </TableCell>
                      <TableCell className="p-6 text-slate-600">
                        {registration.programStudi}
                      </TableCell>
                      <TableCell className="p-6 text-slate-600">
                        {formatDate(registration.createdAt)}
                      </TableCell>
                      <TableCell className="p-6">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="blueOutline"
                            size="sm"
                            onClick={() => handleDownload(registration.id)}
                            className="h-8 w-8 p-0 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="redOutline"
                            size="sm"
                            onClick={() => handleDelete(registration.id)}
                            className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {registrations.length === 0 && (
              <div className="text-center py-16">
                <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  Tidak ada data registrasi
                </h3>
                <p className="text-slate-500">
                  Belum ada mahasiswa yang mendaftar.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
