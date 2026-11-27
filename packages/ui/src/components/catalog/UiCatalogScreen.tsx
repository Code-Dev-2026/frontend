import { useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { baseTokens } from '../../tokens/base';
import { Badge } from '../badge/Badge';
import { Banner } from '../banner/Banner';
import { BrandLoader } from '../brand-loader/BrandLoader';
import { BrandLoadingOverlay } from '../brand-loader/BrandLoadingOverlay';
import { Button } from '../button/Button';
import { Card } from '../card/Card';
import { Modal } from '../dialog/Modal';
import { EmptyState } from '../empty-state/EmptyState';
import { ICON_NAMES, Icon } from '../icon/Icon';
import { Input } from '../input/Input';
import { BottomNavBar, type BottomNavItem } from '../navigation/BottomNavBar';

type CatalogNavTab = 'inicio' | 'mapa' | 'avisos' | 'perfil';

const CATALOG_NAV_ITEMS: ReadonlyArray<BottomNavItem<CatalogNavTab>> = [
  { id: 'inicio', label: 'Inicio', icon: 'house' },
  { id: 'mapa', label: 'Mapa', icon: 'map-pin' },
  { id: 'avisos', label: 'Avisos', icon: 'bell' },
  { id: 'perfil', label: 'Perfil', icon: 'user-round' },
];

export type UiCatalogScreenProps = {
  onBack?: () => void;
};

const COLOR_SWATCHES: ReadonlyArray<{ label: string; value: string }> = [
  { label: 'navy-900', value: baseTokens.colors.navy900 },
  { label: 'cyan-500', value: baseTokens.colors.cyan500 },
  { label: 'orange-500', value: baseTokens.colors.orange500 },
  { label: 'primary-500', value: baseTokens.colors.primary500 },
  { label: 'link-600', value: baseTokens.colors.link600 },
  { label: 'text-strong', value: baseTokens.colors.textStrong },
  { label: 'text-body', value: baseTokens.colors.textBody },
  { label: 'text-muted', value: baseTokens.colors.textMuted },
  { label: 'success-text', value: baseTokens.colors.successText },
  { label: 'warning-text', value: baseTokens.colors.warningText },
  { label: 'critical-solid', value: baseTokens.colors.criticalSolid },
  { label: 'critical-text', value: baseTokens.colors.criticalText },
];

export function UiCatalogScreen({ onBack }: UiCatalogScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isStandardModalVisible, setIsStandardModalVisible] = useState(false);
  const [isCriticalModalVisible, setIsCriticalModalVisible] = useState(false);
  const [isOverlayPreviewVisible, setIsOverlayPreviewVisible] = useState(false);
  const [catalogNavTab, setCatalogNavTab] = useState<CatalogNavTab>('inicio');
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    };
  }, []);

  function previewLoadingOverlay() {
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    setIsOverlayPreviewVisible(true);
    overlayTimerRef.current = setTimeout(() => {
      setIsOverlayPreviewVisible(false);
    }, 2200);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        {onBack ? (
          <Pressable
            accessibilityLabel="Volver"
            accessibilityRole="button"
            onPress={onBack}
            style={styles.backButton}
          >
            <Icon
              name="arrow-left"
              size={20}
              color={baseTokens.colors.navy900}
            />
          </Pressable>
        ) : (
          <View style={styles.backSpacer} />
        )}
        <Text style={styles.headerTitle}>Catálogo UI · @camino/ui</Text>
        <View style={styles.backSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 01 Tokens */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>01 · Colores (cs/*)</Text>
          <View style={styles.swatchGrid}>
            {COLOR_SWATCHES.map((swatch) => (
              <View key={swatch.label} style={styles.swatchItem}>
                <View
                  style={[styles.swatchBox, { backgroundColor: swatch.value }]}
                />
                <Text style={styles.caption}>{swatch.label}</Text>
                <Text style={styles.captionMuted}>{swatch.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 02 Tipografía */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>02 · Tipografía (Inter)</Text>
          <Card>
            <Text style={styles.typeDisplay}>display · 28/36</Text>
            <Text style={styles.typeScreenTitle}>screen-title · 24/32</Text>
            <Text style={styles.typeSection}>section · 18/26</Text>
            <Text style={styles.typeBody}>body · 16/24 Regular</Text>
            <Text style={styles.typeFieldLabel}>field-label · 14/20</Text>
            <Text style={styles.typeBodySmall}>body-small · 14/20</Text>
            <Text style={styles.typeCaption}>caption · 13/18</Text>
            <Text style={styles.typeCounter}>08 min</Text>
          </Card>
        </View>

        {/* 03 Iconos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            03 · Icon ({ICON_NAMES.length} SVGs)
          </Text>
          <Card>
            <View style={styles.iconGrid}>
              {ICON_NAMES.map((iconName) => (
                <View key={iconName} style={styles.iconCell}>
                  <Icon
                    name={iconName}
                    size={baseTokens.sizes.iconDefault}
                    color={baseTokens.colors.navy900}
                  />
                  <Text numberOfLines={1} style={styles.iconLabel}>
                    {iconName}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* 04 Button */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>04 · Button</Text>
          <Button label="Primario · Continuar" onPress={() => undefined} />
          <Button
            label="Secundario / Soft · Volver"
            onPress={() => undefined}
            variant="secondary"
          />
          <Button
            label="Terciario / Enlace · Ver detalles"
            onPress={() => undefined}
            variant="tertiary"
          />
          <Button
            label="Crítico · Confirmar acción"
            onPress={() => undefined}
            variant="critical"
          />
          <Button
            label="Con icono"
            leadingIcon="shield-check"
            onPress={() => undefined}
            variant="primary"
          />
          <Button label="Cargando" loading onPress={() => undefined} />
          <Button
            error
            errorLabel="Reintentar"
            label="Error"
            onPress={() => undefined}
          />
          <Button disabled label="Deshabilitado" onPress={() => undefined} />
        </View>

        {/* 05 Badge */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>05 · Badge (Custodia)</Text>
          <Badge label="En Casa/Espera" variant="neutral" />
          <Badge label="A Bordo del Vehículo" variant="info" />
          <Badge label="Entregado a Adulto Autorizado" variant="success" />
          <Badge label="Ausente Confirmado" variant="outlined" />
          <Badge label="Retorno Seguro a Sede Escolar" variant="warning" />
          <Badge label="En Custodia Institucional" variant="institutional" />
          <Badge label="Restricción de custodia activa" variant="critical" />
        </View>

        {/* 06 Banner */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>06 · Banner</Text>
          <Banner
            message="Consulta el detalle antes de continuar."
            title="Información operativa"
            variant="info"
          />
          <Banner
            message="La operación se registró correctamente."
            title="Acción confirmada"
            variant="success"
          />
          <Banner
            message="Revisa la novedad con coordinación."
            title="Requiere atención"
            variant="warning"
          />
          <Banner
            message="No autorices la entrega sin validación."
            title="Custodia no validada"
            variant="critical"
          />
        </View>

        {/* 07 Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>07 · Input</Text>
          <Input
            helperText="Usa los datos registrados en tu cuenta."
            keyboardType="email-address"
            label="Correo electrónico (estándar · 45 px)"
            onChangeText={setEmail}
            placeholder="nombre@correo.com"
            value={email}
          />
          <Input
            label="Contraseña (con visibilidad)"
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            showPasswordToggle
            value={password}
          />
          <Input
            label="Campo monitora (48 px)"
            platform="monitor"
            placeholder="Código de validación"
          />
          <Input
            error="Revisa este campo para continuar."
            label="Campo con error"
            placeholder="nombre@correo.com"
          />
          <Input
            disabled
            helperText="Este campo es de solo lectura."
            label="Campo deshabilitado"
            value="ruta-03@caminoseguro.co"
          />
        </View>

        {/* 08 Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>08 · Card</Text>
          <Card>
            <Text style={styles.typeSection}>Tarjeta base</Text>
            <Text style={styles.typeBodySmall}>
              Contenedor con borde suave, radio de 16 px y espaciado de tokens.
            </Text>
          </Card>
          <Card state="focused">
            <Text style={styles.typeSection}>Tarjeta en foco</Text>
            <Text style={styles.typeBodySmall}>Borde focus-ring de 2 px.</Text>
          </Card>
          <Card state="error">
            <Text style={styles.typeSection}>Tarjeta en error</Text>
            <Text style={styles.typeBodySmall}>
              No se pudo actualizar. Consulta a coordinación.
            </Text>
          </Card>
          <Card state="disabled">
            <Text style={styles.typeSection}>Tarjeta deshabilitada</Text>
            <Text style={styles.typeBodySmall}>
              Superficie disabled-bg con texto de alto contraste.
            </Text>
          </Card>
        </View>

        {/* 09 EmptyState */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>09 · EmptyState</Text>
          <EmptyState
            actionLabel="Actualizar"
            description="Consulta de nuevo o contacta a coordinación si necesitas ayuda."
            onAction={() => undefined}
            title="Sin recorridos para mostrar"
          />
          <EmptyState
            actionLabel="Reintentar"
            description="Verifica tu conexión e intenta nuevamente."
            onAction={() => undefined}
            state="error"
            title="No pudimos cargar los datos"
          />
          <EmptyState
            actionLabel="Actualizar"
            description="Consultando el estado más reciente."
            onAction={() => undefined}
            state="loading"
            title="Sin recorridos para mostrar"
          />
        </View>

        {/* 10 Modal / Dialog */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10 · Modal / Dialog</Text>
          <Button
            label="Abrir modal informativo"
            onPress={() => setIsStandardModalVisible(true)}
            variant="secondary"
          />
          <Button
            label="Abrir modal crítico bloqueante"
            onPress={() => setIsCriticalModalVisible(true)}
            variant="critical"
          />
        </View>

        {/* 11 BrandLoader */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11 · BrandLoader (Carga)</Text>
          <Card>
            <BrandLoader label="Cargando pantalla…" size={56} />
          </Card>
          <Button
            label="Probar overlay de transición (2 s)"
            onPress={previewLoadingOverlay}
            variant="secondary"
          />
        </View>

        {/* 12 BottomNavBar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            12 · BottomNavBar (Outline → Relleno)
          </Text>
          <Card>
            <BottomNavBar
              activeId={catalogNavTab}
              items={CATALOG_NAV_ITEMS}
              onSelect={setCatalogNavTab}
            />
          </Card>
        </View>
      </ScrollView>

      <BrandLoadingOverlay
        label="Cargando pantalla…"
        visible={isOverlayPreviewVisible}
      />

      <Modal
        message="Revisa los datos antes de confirmar la operación."
        onDismiss={() => setIsStandardModalVisible(false)}
        primaryAction={{
          label: 'Entendido',
          onPress: () => setIsStandardModalVisible(false),
        }}
        secondaryAction={{
          label: 'Cancelar',
          onPress: () => setIsStandardModalVisible(false),
        }}
        title="Confirmación operativa"
        visible={isStandardModalVisible}
      />

      <Modal
        blocking
        message="No se pudo validar al adulto autorizado. Mantén la custodia del menor y contacta a coordinación."
        note="El menor permanece bajo custodia."
        primaryAction={{
          label: 'Contactar coordinación',
          onPress: () => setIsCriticalModalVisible(false),
        }}
        title="Entrega bloqueada"
        tone="critical"
        visible={isCriticalModalVisible}
      />
    </SafeAreaView>
  );
}

const androidTopOffset =
  Platform.OS === 'android'
    ? Math.max(StatusBar.currentHeight ?? 0, baseTokens.spacing.lg)
    : baseTokens.spacing.lg;

const styles = StyleSheet.create({
  screen: {
    backgroundColor: baseTokens.colors.surface,
    flex: 1,
    paddingTop: androidTopOffset,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: baseTokens.colors.borderSoft,
    borderBottomWidth: baseTokens.borderWidth.default,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: baseTokens.sizes.touchMin,
    paddingHorizontal: baseTokens.spacing.lg,
  },
  backButton: {
    alignItems: 'center',
    height: baseTokens.sizes.touchMin,
    justifyContent: 'center',
    width: baseTokens.sizes.touchMin,
  },
  backSpacer: {
    width: baseTokens.sizes.touchMin,
  },
  headerTitle: {
    ...baseTokens.typography.section,
    color: baseTokens.colors.textStrong,
  },
  content: {
    gap: baseTokens.spacing.xl,
    paddingBottom: baseTokens.spacing.xxl,
    paddingHorizontal: baseTokens.spacing.pageMargin,
    paddingTop: baseTokens.spacing.lg,
  },
  section: {
    gap: baseTokens.spacing.md,
  },
  sectionTitle: {
    ...baseTokens.typography.section,
    color: baseTokens.colors.navy900,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: baseTokens.spacing.md,
  },
  swatchItem: {
    gap: baseTokens.spacing.xs,
    width: '30%',
  },
  swatchBox: {
    borderColor: baseTokens.colors.borderSoft,
    borderRadius: baseTokens.radii.input,
    borderWidth: baseTokens.borderWidth.default,
    height: 40,
    width: '100%',
  },
  caption: {
    ...baseTokens.typography.caption,
    color: baseTokens.colors.textStrong,
  },
  captionMuted: {
    ...baseTokens.typography.caption,
    color: baseTokens.colors.textMuted,
  },
  typeDisplay: {
    ...baseTokens.typography.display,
    color: baseTokens.colors.textStrong,
  },
  typeScreenTitle: {
    ...baseTokens.typography.screenTitle,
    color: baseTokens.colors.textStrong,
  },
  typeSection: {
    ...baseTokens.typography.section,
    color: baseTokens.colors.textStrong,
  },
  typeBody: {
    ...baseTokens.typography.body,
    color: baseTokens.colors.textBody,
  },
  typeFieldLabel: {
    ...baseTokens.typography.fieldLabel,
    color: baseTokens.colors.textBody,
  },
  typeBodySmall: {
    ...baseTokens.typography.bodySmall,
    color: baseTokens.colors.textMuted,
  },
  typeCaption: {
    ...baseTokens.typography.caption,
    color: baseTokens.colors.textMuted,
  },
  typeCounter: {
    ...baseTokens.typography.counter,
    color: baseTokens.colors.navy900,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: baseTokens.spacing.md,
  },
  iconCell: {
    alignItems: 'center',
    gap: baseTokens.spacing.xs,
    width: '21%',
  },
  iconLabel: {
    ...baseTokens.typography.caption,
    color: baseTokens.colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
});
