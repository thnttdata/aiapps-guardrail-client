#!/usr/bin/env python3
import os
import sys
import subprocess

# Ensure reportlab is installed
try:
    import reportlab
except ImportError:
    print("Installing reportlab...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "reportlab"])
    import reportlab

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and render total page count
    along with running header and footer.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_elements(num_pages)
            super().showPage()
        super().save()

    def draw_page_elements(self, page_count):
        self.saveState()
        
        # Don't draw headers/footers on page 1 (cover page)
        if self._pageNumber == 1:
            self.restoreState()
            return

        # Header
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#7F8C8D"))
        self.drawString(54, 750, "KDM PHONESHOP — FLAGSHIP TECHNICAL REFERENCE MANUAL")
        
        # Header Line
        self.setStrokeColor(colors.HexColor("#BDC3C7"))
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)

        # Footer Line
        self.line(54, 62, 558, 62)

        # Footer
        self.setFont("Helvetica", 8)
        self.drawString(54, 48, "CONFIDENTIAL — FOR INTERNAL USE AND AUTHORIZED ASSISTANTS ONLY")
        
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 48, page_str)
        
        self.restoreState()

def create_manual_pdf(output_path):
    # Setup document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=72,
        bottomMargin=72
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    primary_color = colors.HexColor("#1A252C") # Dark luxury steel
    secondary_color = colors.HexColor("#D35400") # KDM Amber accent
    text_color = colors.HexColor("#2C3E50")
    accent_bg = colors.HexColor("#F8F9F9")

    # Custom Typography Styles
    styles.add(ParagraphStyle(
        name='CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=primary_color,
        alignment=1, # Center
        spaceAfter=15
    ))

    styles.add(ParagraphStyle(
        name='CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#7F8C8D"),
        alignment=1, # Center
        spaceAfter=40
    ))

    styles.add(ParagraphStyle(
        name='CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#95A5A6"),
        alignment=1, # Center
        spaceAfter=100
    ))

    styles.add(ParagraphStyle(
        name='ManualH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=primary_color,
        spaceBefore=15,
        spaceAfter=12,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name='ManualH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=secondary_color,
        spaceBefore=12,
        spaceAfter=8,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name='ManualBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=text_color,
        spaceAfter=8
    ))

    styles.add(ParagraphStyle(
        name='ManualBodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=primary_color,
        spaceAfter=8
    ))

    styles.add(ParagraphStyle(
        name='TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white,
        alignment=0
    ))

    styles.add(ParagraphStyle(
        name='TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=text_color,
        alignment=0
    ))

    story = []

    # ================= PAGE 1: COVER PAGE =================
    story.append(Spacer(1, 1.5 * inch))
    # Elegant logo placement simulation
    logo_style = ParagraphStyle(
        'Logo',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=36,
        leading=42,
        textColor=secondary_color,
        alignment=1,
        spaceAfter=10
    )
    story.append(Paragraph("KDM", logo_style))
    story.append(Paragraph("TECHNICAL REFERENCE MANUAL", styles['CoverTitle']))
    story.append(Paragraph("Flagship Smartphone Specifications, Engineering Deep-Dives, and Global Warranty Guidelines", styles['CoverSubtitle']))
    
    # Ornamental Amber Bar
    d_table = Table([[""]], colWidths=[300], rowHeights=[4])
    d_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), secondary_color),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(d_table)
    story.append(Spacer(1, 0.5 * inch))
    
    story.append(Spacer(1, 1.5 * inch))
    story.append(Paragraph("<b>Version:</b> 2.4.2<br/><b>Classification:</b> Confidential (L4)<br/><b>Target Audience:</b> Sales Engineers, Authorized Technicians, and KDM AI Assistants", styles['CoverMeta']))
    story.append(PageBreak())

    # ================= PAGE 2: FLAGSHIP LINEUP SPECS =================
    story.append(Paragraph("1. Flagship Device Specifications Comparison", styles['ManualH1']))
    story.append(Paragraph("This section contains verified engineering and retail specifications for KDM’s current product lineup. These technical parameters represent the golden source of truth for comparing device configurations, internal codenames, and retail pricing.", styles['ManualBody']))
    story.append(Spacer(1, 8))

    # Detailed specifications table
    table_data = [
        [
            Paragraph("Parameter", styles['TableHeader']),
            Paragraph("KDM Titan Pro (Flagship)", styles['TableHeader']),
            Paragraph("KDM Titan Air (Slim)", styles['TableHeader']),
            Paragraph("KDM Neo Fold (Hybrid)", styles['TableHeader'])
        ],
        [
            Paragraph("<b>Internal Codename</b>", styles['TableCell']),
            Paragraph("KDM-T9-PRO", styles['TableCell']),
            Paragraph("KDM-T9-AIR", styles['TableCell']),
            Paragraph("KDM-NF9-GOLD", styles['TableCell'])
        ],
        [
            Paragraph("<b>MSRP</b>", styles['TableCell']),
            Paragraph("$1,199 USD", styles['TableCell']),
            Paragraph("$899 USD", styles['TableCell']),
            Paragraph("$1,799 USD", styles['TableCell'])
        ],
        [
            Paragraph("<b>Dimensions</b>", styles['TableCell']),
            Paragraph("159.9 x 76.7 x 8.25 mm<br/>Weight: 221g", styles['TableCell']),
            Paragraph("160.1 x 77.2 x 6.1 mm<br/>Weight: 168g", styles['TableCell']),
            Paragraph("Folded: 155.1 x 72.2 x 14.1 mm<br/>Unfolded: 155.1 x 144.1 x 5.9 mm<br/>Weight: 254g", styles['TableCell'])
        ],
        [
            Paragraph("<b>SoC Processor</b>", styles['TableCell']),
            Paragraph("KDM Bionic Gen 3 Engine<br/>(3nm Dual-Core Neural cluster)", styles['TableCell']),
            Paragraph("KDM Bionic Gen 2 Core<br/>(4nm optimized)", styles['TableCell']),
            Paragraph("KDM Neural Split-Core v3<br/>(Highly parallel multi-screen thread manager)", styles['TableCell'])
        ],
        [
            Paragraph("<b>Camera System</b>", styles['TableCell']),
            Paragraph("200MP Triple Quantum Camera<br/>1/1.12\" Sensor, f/1.4 aperture,<br/>50MP ultra-wide, 12MP 10x optical zoom", styles['TableCell']),
            Paragraph("108MP Quad-Pixel Camera<br/>1/1.5\" Sensor, f/1.8 aperture,<br/>12MP wide, 8MP 3x zoom", styles['TableCell']),
            Paragraph("50MP Continuous Dual-Axis Camera<br/>1/1.3\" Primary Sensor, f/1.6,<br/>under-display cover lens camera", styles['TableCell'])
        ],
        [
            Paragraph("<b>Display Matrix</b>", styles['TableCell']),
            Paragraph("6.7\" Liquid Retinal XDR<br/>1-144Hz LTPO OLED panel<br/>Brightness: 3200 nits peak", styles['TableCell']),
            Paragraph("6.6\" Liquid Retinal IPS<br/>120Hz fixed refresh rate<br/>Brightness: 1800 nits peak", styles['TableCell']),
            Paragraph("8.0\" Continuous Flexible OLED<br/>6.2\" Cover Display<br/>120Hz dynamic refresh LTPO", styles['TableCell'])
        ],
        [
            Paragraph("<b>Battery & Charging</b>", styles['TableCell']),
            Paragraph("5100 mAh Graphene Cell<br/>80W SuperWarp charging (wired)<br/>30W Qi2 wireless charging", styles['TableCell']),
            Paragraph("4200 mAh Lithium-Polymer<br/>45W Standard charging (wired)<br/>15W wireless charging", styles['TableCell']),
            Paragraph("5500 mAh Dual-Anode Battery<br/>100W SuperWarp charging (wired)<br/>50W wireless charging", styles['TableCell'])
        ]
    ]

    col_widths = [1.25 * inch, 1.8 * inch, 1.8 * inch, 2.15 * inch]
    spec_table = Table(table_data, colWidths=col_widths)
    spec_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#BDC3C7")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, accent_bg]),
        ('BOTTOMPADDING', (0,1), (-1,-1), 6),
        ('TOPPADDING', (0,1), (-1,-1), 6),
    ]))
    
    story.append(spec_table)
    story.append(Spacer(1, 12))
    story.append(Paragraph("<b>Note:</b> All flagship models feature standard IP68 ingress protection, under-display ultra-sonic fingerprint recognition, and fully integrated satellite emergency communication capabilities.", styles['ManualBody']))
    story.append(PageBreak())

    # ================= PAGE 3: DEEP ENGINEERING DETAILS =================
    story.append(Paragraph("2. Deep Engineering & Manufacturing Guidelines", styles['ManualH1']))
    
    story.append(Paragraph("2.1 KDM Titan Pro: Quantum Fusion Optics", styles['ManualH2']))
    story.append(Paragraph("The camera assembly of the Titan Pro (KDM-T9-PRO) is engineered using a custom triple-quantum-dot color filter array mapped directly over a 200-megapixel ultra-large back-illuminated sensor. The primary lens configuration utilizes 8 glass elements (8P) with an advanced hydrophobic multi-layer coating. This ensures that lens flare and light scattering are reduced by up to 92.4% under extreme glare conditions.", styles['ManualBody']))
    story.append(Paragraph("Due to the narrow depth of field offered by the physical f/1.4 aperture, the device implements <i>neural sub-pixel alignment</i> to maintain sharp edges across the entire frame. For technical support diagnostics: if a customer reports blurry corner performance, technicians must run the <b>ToolHive OptiCal</b> utility to recalibrate the optical image stabilization (OIS) gyroscope actuators.", styles['ManualBody']))

    story.append(Paragraph("2.2 KDM Neo Fold: Flex-Hinge Structural Durability", styles['ManualH2']))
    story.append(Paragraph("The KDM Neo Fold features the proprietary dual-axis zero-gap <b>Flex-Hinge</b>. Composed of high-tensile titanium alloy (Grade 5 Ti-6Al-4V) and aerospace carbon-fiber weave structures, the hinge mechanism is rated for over 250,000 continuous opening and closing sequences without structural failure or screen fold creasing.", styles['ManualBody']))
    story.append(Paragraph("<b>Environmental Stress Testing Results:</b>", styles['ManualBodyBold']))
    story.append(Paragraph("• <b>Extreme Heat:</b> Operated at 55°C (131°F) for 500 hours with no adhesive softening or OLED discoloration.<br/>• <b>Sub-Zero Cold:</b> Operated at -20°C (-4°F) for 100 hours; continuous folding friction did not exceed 0.12 N-m.<br/>• <b>Particulate Exposure:</b> Tested with micro-silica sand particles under ISO 12103-1 criteria. The internal dual-barrier sweeping bristles successfully rejected 99.8% of micro-particulates.", styles['ManualBody']))
    story.append(Paragraph("<b>Precautionary Maintenance Rules:</b> Liquid or adhesive applications near the center zero-gap hinge will void the warranty. Technicians must never use pressurized compressed air directly into the hinge bristles as this will dislodge the microscopic brush arrays and compromise dust protection.", styles['ManualBody']))
    story.append(PageBreak())

    # ================= PAGE 4: WARRANTY AND SUPPORT POLICIES =================
    story.append(Paragraph("3. Global Warranty, Repair & Support Policies", styles['ManualH1']))
    story.append(Paragraph("This section outlines KDM’s legal and technical parameters regarding product warranties, component replacement, and repair tier levels. Sales engineers and AI assistants must align with these precise terms when addressing customer disputes.", styles['ManualBody']))

    story.append(Paragraph("3.1 Official Warranty Periods", styles['ManualH2']))
    story.append(Paragraph("Each KDM device is accompanied by a limited manufacturer's warranty beginning from the date of activation on the cellular network or billing registry creation:", styles['ManualBody']))
    
    # Warranty table
    w_data = [
        [Paragraph("Model", styles['TableHeader']), Paragraph("Base Warranty Period", styles['TableHeader']), Paragraph("Coverage Scope & Tier Level", styles['TableHeader'])],
        [Paragraph("KDM Titan Pro", styles['TableCell']), Paragraph("24 Months (International)", styles['TableCell']), Paragraph("Full manufacturing and hardware defect coverage. Extends to display degradation and OIS actuator failure.", styles['TableCell'])],
        [Paragraph("KDM Titan Air", styles['TableCell']), Paragraph("12 Months (Regional)", styles['TableCell']), Paragraph("Limited regional hardware coverage. Battery health degradation covered up to 12 months.", styles['TableCell'])],
        [Paragraph("KDM Neo Fold", styles['TableCell']), Paragraph("36 Months (KDM Care+ Elite Included)", styles['TableCell']), Paragraph("Premium priority replacement. Includes 1 free structural folding screen swap per year irrespective of user fault.", styles['TableCell'])],
    ]
    w_table = Table(w_data, colWidths=[1.5*inch, 2.0*inch, 3.5*inch])
    w_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#BDC3C7")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, accent_bg]),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(w_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("3.2 Physical vs Liquid Damage Policy & Diagnosis", styles['ManualH2']))
    story.append(Paragraph("• <b>Liquid Intrusion:</b> While KDM devices are IP68 certified, physical water ingress is NOT covered under the base warranty for Titan Pro or Titan Air. Authorized technicians must inspect the internal <b>Liquid Contact Indicator (LCI)</b>. The LCI is situated inside the physical SIM-tray slot for all T9 models, and within the secondary charging port board for the Neo Fold. A change from solid white to bright crimson red (Hex Code #E74C3C) verifies exposure to liquid and nullifies standard warranty claims.", styles['ManualBody']))
    story.append(Paragraph("• <b>Screen Cracks and Structural Impact:</b> Exterior cosmetic or structural damage resulting from drops or excessive compression is not covered under the base warranty. For Neo Fold devices, if the outer cover screen is cracked but the internal folding display remains fully functional, the outer screen can be repaired independently under <b>Repair Tier 2 ($149 flat-rate)</b> instead of requiring a full display assembly rebuild ($499).", styles['ManualBody']))
    story.append(Paragraph("• <b>Service Level Agreements (SLA):</b> Standard technical diagnostic and repair cycle times must not exceed 48 business hours from check-in at any authorized service boutique. If a replacement motherboard is back-ordered for more than 5 business days, the service center is required to issue a brand-new factory-sealed retail unit to the client.", styles['ManualBody']))

    # Build the document using the NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully compiled deep technical manual to {output_path}")

if __name__ == "__main__":
    output_dir = "uploads"
    os.makedirs(output_dir, exist_ok=True)
    target_path = os.path.join(output_dir, "kdm_phones_deep_manual.pdf")
    create_manual_pdf(target_path)
