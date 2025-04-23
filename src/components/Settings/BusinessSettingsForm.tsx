import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BusinessSettingsFormProps {
  storeName: string;
  setStoreName: (value: string) => void;
  storePhone: string;
  setStorePhone: (value: string) => void;
  storeEmail: string;
  setStoreEmail: (value: string) => void;
  storeAddress: string;
  setStoreAddress: (value: string) => void;
  openingTime: string;
  setOpeningTime: (value: string) => void;
  closingTime: string;
  setClosingTime: (value: string) => void;
  taxRate: string;
  setTaxRate: (value: string) => void;
  currency: string;
  setCurrency: (value: string) => void;
  timezone: string;
  setTimezone: (value: string) => void;
}

export const BusinessSettingsForm = ({
  storeName,
  setStoreName,
  storePhone,
  setStorePhone,
  storeEmail,
  setStoreEmail,
  storeAddress,
  setStoreAddress,
  openingTime,
  setOpeningTime,
  closingTime,
  setClosingTime,
  taxRate,
  setTaxRate,
  currency,
  setCurrency,
  timezone,
  setTimezone,
}: BusinessSettingsFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="storeName">Nom du magasin</Label>
        <Input
          id="storeName"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="Entrez le nom du magasin"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="storePhone">Numéro de téléphone</Label>
        <Input
          id="storePhone"
          value={storePhone}
          onChange={(e) => setStorePhone(e.target.value)}
          placeholder="Entrez le numéro de téléphone"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="storeEmail">Email</Label>
        <Input
          id="storeEmail"
          type="email"
          value={storeEmail}
          onChange={(e) => setStoreEmail(e.target.value)}
          placeholder="Entrez l'adresse email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="taxRate">Taux de TVA (%)</Label>
        <Input
          id="taxRate"
          type="number"
          value={taxRate}
          onChange={(e) => setTaxRate(e.target.value)}
          placeholder="Entrez le taux de TVA"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="openingTime">Heure d'ouverture</Label>
        <Input
          id="openingTime"
          type="time"
          value={openingTime}
          onChange={(e) => setOpeningTime(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="closingTime">Heure de fermeture</Label>
        <Input
          id="closingTime"
          type="time"
          value={closingTime}
          onChange={(e) => setClosingTime(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Devise</Label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger id="currency">
            <SelectValue placeholder="Sélectionnez la devise" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="XOF">F CFA (XOF)</SelectItem>
            <SelectItem value="EUR">EUR (€)</SelectItem>
            <SelectItem value="USD">USD ($)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Fuseau horaire</Label>
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger id="timezone">
            <SelectValue placeholder="Sélectionnez le fuseau horaire" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Africa/Abidjan">Afrique/Abidjan</SelectItem>
            <SelectItem value="Africa/Dakar">Afrique/Dakar</SelectItem>
            <SelectItem value="Africa/Bamako">Afrique/Bamako</SelectItem>
            <SelectItem value="UTC">UTC</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-full space-y-2">
        <Label htmlFor="storeAddress">Adresse</Label>
        <Textarea
          id="storeAddress"
          value={storeAddress}
          onChange={(e) => setStoreAddress(e.target.value)}
          placeholder="Entrez l'adresse du magasin"
        />
      </div>
    </div>
  );
};