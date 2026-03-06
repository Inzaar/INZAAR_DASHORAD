import React from 'react';

/**
 * CertificateCard — rendered off-screen, then captured by html2canvas as a PNG.
 * Props:
 *  ref         — forwarded ref so parent can call html2canvas on the DOM node
 *  studentName — full name of the student
 *  courseName  — title of the completed course
 *  completedAt — ISO date string or Date object
 */
const CertificateCard = React.forwardRef(({ studentName, courseName, completedAt, templateUrl }, ref) => {
    const dateStr = completedAt
        ? new Date(completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const isCustomTemplate = templateUrl && !templateUrl.includes('eqxvbyw67fanduhxjrdf.png');

    return (
        <div
            ref={ref}
            style={{
                width: '100%',
                height: '100%',
                background: isCustomTemplate ? `#ffffff url('${templateUrl}') no-repeat center/cover` : '#1a1040',
                backgroundImage: isCustomTemplate ? `url('${templateUrl}')` : 'linear-gradient(135deg, #1a1040 0%, #2d1b69 50%, #1a1040 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                fontFamily: 'Georgia, serif',
                overflow: 'hidden',
                padding: '48px',
                boxSizing: 'border-box',
                color: isCustomTemplate ? '#000000' : '#ffffff'
            }}
        >
            {!isCustomTemplate && (
                <>
                    {/* Decorative corner accents */}
                    {[
                        { top: '16px', left: '16px' },
                        { top: '16px', right: '16px' },
                        { bottom: '16px', left: '16px' },
                        { bottom: '16px', right: '16px' },
                    ].map((pos, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            width: '60px',
                            height: '60px',
                            border: '2px solid #c9a227',
                            ...pos,
                        }} />
                    ))}

                    {/* Outer decorative border */}
                    <div style={{
                        position: 'absolute',
                        top: '28px',
                        left: '28px',
                        right: '28px',
                        bottom: '28px',
                        border: '1px solid rgba(201, 162, 39, 0.35)',
                        borderRadius: '4px',
                        pointerEvents: 'none',
                    }} />

                    {/* Watermark circles */}
                    <div style={{
                        position: 'absolute',
                        width: '400px',
                        height: '400px',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        borderRadius: '200px',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }} />
                    <div style={{
                        position: 'absolute',
                        width: '300px',
                        height: '300px',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        borderRadius: '150px',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }} />

                    {/* Top badge */}
                    <div style={{
                        background: '#c9a227',
                        backgroundImage: 'linear-gradient(90deg, #c9a227, #f0d060, #c9a227)',
                        color: '#1a1040',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        letterSpacing: '4px',
                        padding: '6px 24px',
                        borderRadius: '20px',
                        textTransform: 'uppercase',
                        marginBottom: '20px',
                        fontFamily: 'Arial, sans-serif',
                    }}>
                        INZAAR ACADEMY
                    </div>

                    {/* Certificate of Completion */}
                    <div style={{
                        fontSize: '13px',
                        letterSpacing: '6px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        textTransform: 'uppercase',
                        marginBottom: '12px',
                        fontFamily: 'Arial, sans-serif',
                    }}>
                        CERTIFICATE OF COMPLETION
                    </div>

                    {/* Divider */}
                    <div style={{
                        width: '80px',
                        height: '2px',
                        background: '#c9a227',
                        backgroundImage: 'linear-gradient(90deg, rgba(201,162,39,0), rgba(201,162,39,1), rgba(201,162,39,0))',
                        marginBottom: '24px',
                    }} />

                    {/* "This is to certify that" */}
                    <div style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '14px', marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>
                        This is to certify that
                    </div>
                </>
            )}

            {/* Student Name */}
            <div style={{
                fontSize: '44px',
                fontWeight: 'bold',
                color: isCustomTemplate ? '#1a1040' : '#ffffff',
                letterSpacing: '1px',
                marginBottom: isCustomTemplate ? '20px' : '8px',
                marginTop: isCustomTemplate ? '100px' : '0px',
                textShadow: isCustomTemplate ? 'none' : '0px 2px 20px rgba(201, 162, 39, 0.3)',
            }}>
                {studentName}
            </div>

            {!isCustomTemplate && (
                <div style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '14px', marginBottom: '16px', fontFamily: 'Arial, sans-serif' }}>
                    has successfully completed the course
                </div>
            )}

            {/* Course Name */}
            <div style={{
                fontSize: '22px',
                color: isCustomTemplate ? '#1a1040' : '#f0d060',
                fontWeight: isCustomTemplate ? 'bold' : 'normal',
                textAlign: 'center',
                maxWidth: '640px',
                lineHeight: '1.35',
                marginBottom: isCustomTemplate ? '20px' : '28px',
            }}>
                {courseName}
            </div>

            {/* Date */}
            <div style={{
                fontSize: '13px',
                color: isCustomTemplate ? '#1a1040' : 'rgba(255, 255, 255, 0.45)',
                fontWeight: isCustomTemplate ? 'bold' : 'normal',
                fontFamily: 'Arial, sans-serif',
                letterSpacing: '1px',
            }}>
                {isCustomTemplate ? dateStr : `Awarded on ${dateStr}`}
            </div>

            {!isCustomTemplate && (
                <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    right: '64px',
                    width: '70px',
                    height: '70px',
                    borderRadius: '35px',
                    border: '2px solid #c9a227',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(201, 162, 39, 0.1)',
                }}>
                    <div style={{ fontSize: '20px' }}>✦</div>
                </div>
            )}
        </div>
    );
});

CertificateCard.displayName = 'CertificateCard';
export default CertificateCard;
